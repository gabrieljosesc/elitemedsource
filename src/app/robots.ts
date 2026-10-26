import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/checkout", "/cart", "/auth", "/api", "/order-confirmed", "/wishlist"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
