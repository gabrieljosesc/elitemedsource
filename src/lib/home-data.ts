import { createAdminClient } from "@/lib/supabase/server";
import { mapRow } from "@/lib/shop-products";
import type { CatalogProduct } from "@/lib/types";

export type HomeCategory = {
  slug: string;
  name: string;
  productCount: number;
};

export type HeroProduct = CatalogProduct & {
  specs: Array<{ label: string; value: string }>;
};

const PRODUCT_FIELDS =
  "id, slug, name, sku, price, price_tiers, is_free, stock_quantity, is_in_stock, specs, images, brands(name), categories(name)";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Placeholder catalog shown only if Supabase isn't configured yet, or a
// query genuinely returns nothing (e.g. before any product is seeded).
const FALLBACK_CATEGORIES: HomeCategory[] = [
  { slug: "dermal-fillers", name: "Dermal Fillers", productCount: 0 },
  { slug: "botulinum-toxins", name: "Botulinum Toxins", productCount: 0 },
  { slug: "orthopedic-injections", name: "Orthopedic Injections", productCount: 0 },
  { slug: "threads", name: "Threads", productCount: 0 },
];

const FALLBACK_HERO_PRODUCT: HeroProduct = {
  id: "remicade-100mg-vial",
  slug: "remicade-100mg-vial",
  name: "Remicade 100mg vial",
  brand: "Remicade",
  price: 549,
  sku: "RHE-REM-100",
  specLine: "100 mg · lyophilized · single vial",
  stockLabel: "in-stock",
  categoryLabel: "Rheumatology",
  image: null,
  priceTiers: [],
  isFree: false,
  specs: [
    { label: "Strength", value: "100 mg" },
    { label: "Form", value: "Lyophilized" },
    { label: "Pack", value: "1 vial" },
    { label: "Storage", value: "2–8 °C" },
  ],
};

// The eight categories showcased on the home page, in display order
// (row 1, then row 2 of the grid).
const HOME_CATEGORY_SLUGS = [
  "rheumatology",
  "orthopedic-injections",
  "ophthalmology",
  "gynecology",
  "dermal-fillers",
  "botulinum-toxins",
  "peels-and-masks",
  "peptides",
];

export async function getHomeCategories(): Promise<HomeCategory[]> {
  if (!isSupabaseConfigured()) return FALLBACK_CATEGORIES;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("slug, name, id")
      .in("slug", HOME_CATEGORY_SLUGS);

    if (error || !data || data.length === 0) return FALLBACK_CATEGORIES;

    const categories = HOME_CATEGORY_SLUGS.flatMap((slug) => {
      const match = data.find((c) => c.slug === slug);
      return match ? [match] : [];
    });

    const withCounts = await Promise.all(
      categories.map(async (c) => {
        const { count } = await admin
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", c.id)
          .eq("is_in_stock", true);
        return { slug: c.slug, name: c.name, productCount: count ?? 0 };
      })
    );

    return withCounts;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getBestSellers(): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const admin = createAdminClient();
    const { data: products, error } = await admin
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("featured", true)
      .eq("is_in_stock", true)
      .limit(4);

    if (error || !products) return [];

    return products.map(mapRow);
  } catch {
    return [];
  }
}

// The category the home page leads with. Hero slides and the spotlight
// section come from here; other categories backfill when it runs short.
export const FOCUS_CATEGORY_SLUG = "rheumatology";

// Optional: pin specific product slugs to the hero carousel (in slide
// order). Leave empty to lead with the focus category's products.
const HERO_PRODUCT_SLUGS: string[] = [];

async function getFocusCategoryId(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.from("categories").select("id").eq("slug", FOCUS_CATEGORY_SLUG).single();
  return data?.id ?? null;
}

/** In-stock products from the focus category (featured first), for the home spotlight. */
export async function getFocusCategoryProducts(limit = 8): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const admin = createAdminClient();
    const categoryId = await getFocusCategoryId(admin);
    if (!categoryId) return [];

    const { data, error } = await admin
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("category_id", categoryId)
      .eq("is_in_stock", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

export async function getHeroProducts(): Promise<HeroProduct[]> {
  if (!isSupabaseConfigured()) return [FALLBACK_HERO_PRODUCT];

  try {
    const admin = createAdminClient();
    const categoryId = await getFocusCategoryId(admin);

    const [{ data: focus }, { data: featured }] = await Promise.all([
      categoryId
        ? admin
            .from("products")
            .select(PRODUCT_FIELDS)
            .eq("category_id", categoryId)
            .eq("is_in_stock", true)
            .order("featured", { ascending: false })
            .order("name", { ascending: true })
            .limit(20)
        : Promise.resolve({ data: [] as never[] }),
      admin.from("products").select(PRODUCT_FIELDS).eq("featured", true).eq("is_in_stock", true).limit(20),
    ]);

    const pool = [...(focus ?? []), ...(featured ?? [])].filter(
      (p, i, arr) => arr.findIndex((q) => q.id === p.id) === i
    );
    if (pool.length === 0) return [FALLBACK_HERO_PRODUCT];

    // Pinned slides first (in their listed order), then focus-category
    // products with a photo, then other featured products, up to five.
    const pinned = HERO_PRODUCT_SLUGS.flatMap((slug) => {
      const match = pool.find((p) => p.slug === slug);
      return match ? [match] : [];
    });
    const backfill = pool.filter(
      (p) => !HERO_PRODUCT_SLUGS.includes(p.slug) && (p.images ?? []).length > 0
    );

    return [...pinned, ...backfill].slice(0, 5).map((p) => ({
      ...mapRow(p),
      specs: (p.specs ?? []) as Array<{ label: string; value: string }>,
    }));
  } catch {
    return [FALLBACK_HERO_PRODUCT];
  }
}
