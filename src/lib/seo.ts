interface SeoPayload {
  title: string;
  description: string;
}

function upsertMeta(
  key: "name" | "property",
  value: string,
  content: string,
): void {
  const selector = `meta[${key}="${value}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(key, value);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(canonicalUrl: string): void {
  let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", canonicalUrl);
}

export function applySeoMetadata({ title, description }: SeoPayload): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

  document.title = title;
  upsertCanonical(canonicalUrl);

  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
}
