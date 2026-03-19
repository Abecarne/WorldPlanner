import allTheCities from "all-the-cities";
import fs from "node:fs/promises";
import tzlookup from "tz-lookup";

const OUTPUT_PATH = new URL("../public/cities.json", import.meta.url);
const MIN_POPULATION = 500000;
const MAX_CITIES = 220;

const frenchAliases = {
  Amsterdam: ["Amsterdam"],
  Athens: ["Athenes"],
  Bangkok: ["Bangkok"],
  Barcelona: ["Barcelone"],
  Beijing: ["Pekin"],
  Brussels: ["Bruxelles"],
  Bucharest: ["Bucarest"],
  Cairo: ["Le Caire"],
  Cologne: ["Cologne"],
  Copenhagen: ["Copenhague"],
  Doha: ["Doha"],
  Florence: ["Florence"],
  Frankfurt: ["Francfort"],
  Geneva: ["Geneve"],
  Hamburg: ["Hambourg"],
  Hanoi: ["Hanoi"],
  Istanbul: ["Istanbul"],
  Lisbon: ["Lisbonne"],
  London: ["Londres"],
  Luxembourg: ["Luxembourg"],
  Lyon: ["Lyon"],
  Marseille: ["Marseille"],
  Milan: ["Milan"],
  Montreal: ["Montreal"],
  Moscow: ["Moscou"],
  Munich: ["Munich"],
  Naples: ["Naples"],
  New: ["Nouveau"],
  "New York City": ["New York", "Nouvelle-York"],
  Nice: ["Nice"],
  Paris: ["Paris"],
  Prague: ["Prague"],
  Rome: ["Rome"],
  Saint: ["Saint"],
  Seoul: ["Seoul"],
  Singapore: ["Singapour"],
  Stockholm: ["Stockholm"],
  Sydney: ["Sydney"],
  Tehran: ["Teheran"],
  Tokyo: ["Tokyo"],
  Turin: ["Turin"],
  Venice: ["Venise"],
  Vienna: ["Vienne"],
  Warsaw: ["Varsovie"],
  Zurich: ["Zurich"],
};

const normalizedNameOverrides = {
  "New York City": "New York",
  "Sao Paulo": "Sao Paulo",
  "Ho Chi Minh City": "Ho Chi Minh City",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function codeToFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function normalizeName(name) {
  return normalizedNameOverrides[name] ?? name;
}

function pickAliases(cityName, altName) {
  const aliases = new Set();
  const cityParts = cityName.split(/\s+/);

  for (const part of cityParts) {
    const mapped = frenchAliases[part];
    if (mapped) {
      mapped.forEach((alias) => aliases.add(alias));
    }
  }

  const directMapped = frenchAliases[cityName];
  if (directMapped) {
    directMapped.forEach((alias) => aliases.add(alias));
  }

  if (altName && altName.length > 1) {
    altName
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 1)
      .slice(0, 3)
      .forEach((item) => aliases.add(item));
  }

  aliases.delete(cityName);

  return [...aliases].slice(0, 5);
}

const topCities = allTheCities
  .filter(
    (city) =>
      city.population >= MIN_POPULATION && city.loc?.coordinates?.length === 2,
  )
  .sort((a, b) => b.population - a.population);

const deduped = [];
const seen = new Set();

for (const city of topCities) {
  const name = normalizeName(city.name);
  const key = `${name.toLowerCase()}|${city.country}`;

  if (seen.has(key)) {
    continue;
  }

  const [longitude, latitude] = city.loc.coordinates;
  let timezone = "";

  try {
    timezone = tzlookup(latitude, longitude);
  } catch {
    continue;
  }

  const country = regionNames.of(city.country) ?? city.country;
  const aliases = pickAliases(name, city.altName);

  deduped.push({
    name,
    country,
    countryCode: city.country,
    timezone,
    flag: codeToFlag(city.country),
    ...(aliases.length > 0 ? { aliases } : {}),
  });

  seen.add(key);

  if (deduped.length >= MAX_CITIES) {
    break;
  }
}

await fs.writeFile(OUTPUT_PATH, JSON.stringify(deduped, null, 2), "utf8");
console.log(`Generated ${deduped.length} cities into public/cities.json`);
