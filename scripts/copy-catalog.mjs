/**
 * Copies the product catalog (categories, brands, products, extra COAs)
 * from another Supabase project — e.g. Ace Medical — into this site's
 * project, and re-hosts every image / COA file that lives in any other
 * Supabase project's storage (the source, or an older sister site it still
 * links to) so nothing points back at the old projects.
 *
 * Usage:
 *   node scripts/copy-catalog.mjs --source-url=https://xxxx.supabase.co --source-key=<service role key>
 *   node scripts/copy-catalog.mjs --source-url=... --source-key=... --skip-files   (keep source URLs)
 *
 * Reads this project's NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Idempotent: upserts by slug, re-uploads files with upsert.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), quiet: true });

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    })
);

const SOURCE_URL = args["source-url"] || process.env.SOURCE_SUPABASE_URL;
const SOURCE_KEY = args["source-key"] || process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY;
const TARGET_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const TARGET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SKIP_FILES = Boolean(args["skip-files"]);

if (!SOURCE_URL || !SOURCE_KEY) {
  console.error("Missing --source-url / --source-key (or SOURCE_SUPABASE_URL / SOURCE_SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}
if (!TARGET_URL || !TARGET_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const source = createClient(SOURCE_URL, SOURCE_KEY, { auth: { persistSession: false } });
const target = createClient(TARGET_URL, TARGET_KEY, { auth: { persistSession: false } });

const targetStoragePrefix = `${TARGET_URL.replace(/\/$/, "")}/storage/v1/object/public/`;
// Any public Supabase Storage URL on another project (the source, or an older
// sister site its catalog still points at) gets re-hosted here.
const STORAGE_URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

async function selectAll(client, table, columns) {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const fileCache = new Map();

/** Re-host a public storage URL from the source project in the target project. */
async function rehost(url) {
  if (!url || SKIP_FILES || url.startsWith(targetStoragePrefix)) return url;
  const match = url.match(STORAGE_URL_RE);
  if (!match) return url; // not a Supabase Storage file — leave as is
  if (fileCache.has(url)) return fileCache.get(url);

  const bucket = match[1];
  const objectPath = decodeURIComponent(match[2]);
  const rel = `${bucket}/${objectPath}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const { error } = await target.storage.from(bucket).upload(objectPath, body, { contentType, upsert: true });
    if (error) throw error;
    const { data } = target.storage.from(bucket).getPublicUrl(objectPath);
    fileCache.set(url, data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.warn(`  ! could not re-host ${rel}: ${err.message} — keeping source URL`);
    fileCache.set(url, url);
    return url;
  }
}

console.log(`Copying catalog\n  from ${SOURCE_URL}\n  to   ${TARGET_URL}\n`);

// 1. Categories (preserve hierarchy via slug → id map)
const srcCategories = await selectAll(source, "categories", "id, name, slug, parent_id, description, image_url, sort_order");
const srcCatById = new Map(srcCategories.map((c) => [c.id, c]));
{
  const rows = srcCategories.map(({ name, slug, description, image_url, sort_order }) => ({
    name, slug, description, image_url, sort_order,
  }));
  const { error } = await target.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`categories upsert: ${error.message}`);
}
const tgtCategories = await selectAll(target, "categories", "id, slug");
const catIdBySlug = new Map(tgtCategories.map((c) => [c.slug, c.id]));
for (const c of srcCategories) {
  if (!c.parent_id) continue;
  const parentSlug = srcCatById.get(c.parent_id)?.slug;
  if (!parentSlug) continue;
  await target.from("categories").update({ parent_id: catIdBySlug.get(parentSlug) ?? null }).eq("slug", c.slug);
}
console.log(`✓ ${srcCategories.length} categories`);

// 2. Brands
const srcBrands = await selectAll(source, "brands", "id, name, slug");
{
  const { error } = await target
    .from("brands")
    .upsert(srcBrands.map(({ name, slug }) => ({ name, slug })), { onConflict: "slug" });
  if (error) throw new Error(`brands upsert: ${error.message}`);
}
const tgtBrands = await selectAll(target, "brands", "id, slug");
const brandIdBySlug = new Map(tgtBrands.map((b) => [b.slug, b.id]));
const srcBrandById = new Map(srcBrands.map((b) => [b.id, b]));
console.log(`✓ ${srcBrands.length} brands`);

// 3. Products (+ re-hosted images / COAs)
const srcProducts = await selectAll(
  source,
  "products",
  "id, name, slug, description, short_description, price, price_tiers, sale_price, sku, stock_quantity, is_in_stock, is_free, category_id, brand_id, images, coa_url, specs, featured"
);
const srcProductIdToSlug = new Map(srcProducts.map((p) => [p.id, p.slug]));

let n = 0;
for (const p of srcProducts) {
  const images = [];
  for (const img of p.images ?? []) images.push(await rehost(img));
  const row = {
    name: p.name,
    slug: p.slug,
    description: p.description,
    short_description: p.short_description,
    price: p.price,
    price_tiers: p.price_tiers ?? [],
    sale_price: p.sale_price,
    sku: p.sku,
    stock_quantity: p.stock_quantity,
    is_in_stock: p.is_in_stock,
    is_free: p.is_free ?? false,
    category_id: p.category_id ? (catIdBySlug.get(srcCatById.get(p.category_id)?.slug) ?? null) : null,
    brand_id: p.brand_id ? (brandIdBySlug.get(srcBrandById.get(p.brand_id)?.slug) ?? null) : null,
    images,
    coa_url: await rehost(p.coa_url),
    specs: p.specs ?? [],
    featured: p.featured ?? false,
  };
  const { error } = await target.from("products").upsert(row, { onConflict: "slug" });
  if (error) {
    console.warn(`  ! ${p.slug}: ${error.message}`);
    continue;
  }
  n += 1;
  if (n % 50 === 0) console.log(`  … ${n}/${srcProducts.length} products`);
}
console.log(`✓ ${n} products`);

// 4. Extra COAs
const srcCoas = await selectAll(source, "product_coas", "product_id, label, file_url, sort_order");
if (srcCoas.length > 0) {
  const tgtProducts = await selectAll(target, "products", "id, slug");
  const productIdBySlug = new Map(tgtProducts.map((p) => [p.slug, p.id]));
  let c = 0;
  for (const coa of srcCoas) {
    const product_id = productIdBySlug.get(srcProductIdToSlug.get(coa.product_id));
    if (!product_id) continue;
    const file_url = await rehost(coa.file_url);
    // avoid duplicates on re-run
    await target.from("product_coas").delete().eq("product_id", product_id).eq("label", coa.label);
    const { error } = await target
      .from("product_coas")
      .insert({ product_id, label: coa.label, file_url, sort_order: coa.sort_order ?? 0 });
    if (!error) c += 1;
  }
  console.log(`✓ ${c} additional COAs`);
}

console.log(
  SKIP_FILES
    ? "\nDone (files left on the source project)."
    : `\nDone. ${fileCache.size} files re-hosted under ${targetStoragePrefix}`
);
