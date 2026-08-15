import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The private areas behind auth, plus the auth endpoints themselves.
      // These are already protected by src/proxy.ts — this only keeps them
      // out of the crawl budget and out of search results.
      disallow: ["/dashboard", "/instructor", "/admin", "/api/", "/login"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
