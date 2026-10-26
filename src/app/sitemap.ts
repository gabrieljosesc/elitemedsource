import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

const STATIC_PATHS = [
  "",
  "/shop",
  "/peptides",
  "/about",
  "/blog",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/authenticity",
  "/referral",
  "/trade/terms",
  "/legal/privacy",
  "/legal/terms",
  "/legal/licensing",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));

  try {
    const admin = createAdminClient();
    const [{ data: categories }, { data: products }, { data: posts }] = await Promise.all([
      admin.from("categories").select("slug"),
      admin.from("products").select("slug, updated_at"),
      admin.from("blog_posts").select("slug, published_at").eq("is_published", true),
    ]);

    for (const c of categories ?? []) {
      entries.push({ url: `${base}/shop/${c.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const p of products ?? []) {
      entries.push({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const post of posts ?? []) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  } catch {
    // Catalog unavailable at build time — ship the static entries only.
  }

  return entries;
}
