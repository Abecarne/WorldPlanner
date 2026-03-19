export interface RawCity {
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  flag: string;
  aliases?: string[];
}

export interface City extends RawCity {
  id: string;
  searchIndex: string;
}

let cache: City[] | null = null;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function buildCityId(city: RawCity): string {
  const safeName = normalizeSearchText(city.name).replace(/[^a-z0-9]+/g, "-");
  const safeCountry = city.countryCode.toLowerCase();
  const safeZone = city.timezone.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${safeName}-${safeCountry}-${safeZone}`;
}

function enrichCity(city: RawCity): City {
  const searchParts = [
    city.name,
    city.country,
    city.countryCode,
    city.timezone,
    ...(city.aliases ?? []),
  ];

  return {
    ...city,
    id: buildCityId(city),
    searchIndex: normalizeSearchText(searchParts.join(" ")),
  };
}

export function normalizeQuery(value: string): string {
  return normalizeSearchText(value);
}

export async function loadCities(): Promise<City[]> {
  if (cache) {
    return cache;
  }

  const response = await fetch("/cities.json");
  if (!response.ok) {
    throw new Error("Impossible de charger le dataset des villes");
  }

  const rawCities = (await response.json()) as RawCity[];
  cache = rawCities.map(enrichCity);
  return cache;
}
