import { track } from "@vercel/analytics";
import type { City } from "../data/cities";

const DIRECT_SOURCE = "(direct)";
const NONE = "(none)";

function normalizeField(value: string | null, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, 120);
}

function getReferrerHost(): string {
  if (typeof document === "undefined" || !document.referrer) {
    return DIRECT_SOURCE;
  }

  try {
    return new URL(document.referrer).host || DIRECT_SOURCE;
  } catch {
    return DIRECT_SOURCE;
  }
}

export function trackAcquisitionVisit(): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const referrerHost = getReferrerHost();

  const source = normalizeField(
    params.get("utm_source"),
    referrerHost === DIRECT_SOURCE ? DIRECT_SOURCE : referrerHost,
  );

  const medium = normalizeField(
    params.get("utm_medium"),
    referrerHost === DIRECT_SOURCE ? NONE : "referral",
  );

  const campaign = normalizeField(params.get("utm_campaign"), NONE);
  const term = normalizeField(params.get("utm_term"), NONE);
  const content = normalizeField(params.get("utm_content"), NONE);

  track("visit_acquisition", {
    source,
    medium,
    campaign,
    term,
    content,
    referrerHost,
    landingPath: window.location.pathname,
  });
}

export function trackSelectionSnapshot(
  selectedCities: City[],
  referenceCity: City | null,
): void {
  if (selectedCities.length === 0) {
    return;
  }

  const countryCodes = [...new Set(selectedCities.map((city) => city.countryCode))].sort();
  const countryNames = [...new Set(selectedCities.map((city) => city.country))].sort();
  const cityNames = selectedCities.map((city) => city.name);

  track("planner_selection_updated", {
    cityCount: selectedCities.length,
    countryCount: countryCodes.length,
    countries: countryCodes.join(",").slice(0, 240),
    countryNames: countryNames.join(", ").slice(0, 240),
    cities: cityNames.join(", ").slice(0, 240),
    referenceCity: referenceCity?.name ?? "none",
    referenceTimezone: referenceCity?.timezone ?? "none",
  });
}
