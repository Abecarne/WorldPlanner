import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.resolve("public");

function normalizeBaseUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  const withProtocol = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  try {
    const parsed = new URL(withProtocol);
    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

const fallbackUrl = "https://example.com";
const siteUrl =
  normalizeBaseUrl(process.env.SITE_URL) ??
  normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeBaseUrl(process.env.VERCEL_URL) ??
  fallbackUrl;

const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;

await fs.mkdir(PUBLIC_DIR, { recursive: true });
await fs.writeFile(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt, "utf8");
await fs.writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf8");

if (siteUrl === fallbackUrl) {
  console.warn(
    "[generate-seo] SITE_URL is missing. robots.txt and sitemap.xml use https://example.com.",
  );
}

console.log(`[generate-seo] Generated robots.txt and sitemap.xml for ${siteUrl}`);
