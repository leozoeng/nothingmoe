import type { MetadataRoute } from "next";
import { sites } from "@/lib/sites";

export default function sitemap(): MetadataRoute.Sitemap {
  const sitePages = sites.map((site) => ({
    url: `https://nothingmoe.com/site/${site.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://nothingmoe.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sitePages,
  ];
}
