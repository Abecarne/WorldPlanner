import allTheCities from "all-the-cities";
import fs from "node:fs/promises";
import tzlookup from "tz-lookup";

const OUTPUT_PATH = new URL("../public/cities.json", import.meta.url);
const MIN_POPULATION = 500000;
const MAX_CITIES = 350;

// List of world capitals with their names and country codes
const WORLD_CAPITALS = [
  { name: 'Kabul', countryCode: 'AF' },
  { name: 'Tirana', countryCode: 'AL' },
  { name: 'Algiers', countryCode: 'DZ' },
  { name: 'Andorra la Vella', countryCode: 'AD' },
  { name: 'Luanda', countryCode: 'AO' },
  { name: 'Saint John\'s', countryCode: 'AG' },
  { name: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Yerevan', countryCode: 'AM' },
  { name: 'Canberra', countryCode: 'AU' },
  { name: 'Vienna', countryCode: 'AT' },
  { name: 'Baku', countryCode: 'AZ' },
  { name: 'Nassau', countryCode: 'BS' },
  { name: 'Manama', countryCode: 'BH' },
  { name: 'Dhaka', countryCode: 'BD' },
  { name: 'Bridgetown', countryCode: 'BB' },
  { name: 'Minsk', countryCode: 'BY' },
  { name: 'Brussels', countryCode: 'BE' },
  { name: 'Belmopan', countryCode: 'BZ' },
  { name: 'Porto-Novo', countryCode: 'BJ' },
  { name: 'Thimphu', countryCode: 'BT' },
  { name: 'La Paz', countryCode: 'BO' },
  { name: 'Sarajevo', countryCode: 'BA' },
  { name: 'Gaborone', countryCode: 'BW' },
  { name: 'Brasília', countryCode: 'BR' },
  { name: 'Bandar Seri Begawan', countryCode: 'BN' },
  { name: 'Sofia', countryCode: 'BG' },
  { name: 'Ouagadougou', countryCode: 'BF' },
  { name: 'Naypyidaw', countryCode: 'MM' },
  { name: 'Gitega', countryCode: 'BI' },
  { name: 'Phnom Penh', countryCode: 'KH' },
  { name: 'Yaoundé', countryCode: 'CM' },
  { name: 'Ottawa', countryCode: 'CA' },
  { name: 'Praia', countryCode: 'CV' },
  { name: 'Bangui', countryCode: 'CF' },
  { name: 'N\'Djamena', countryCode: 'TD' },
  { name: 'Santiago', countryCode: 'CL' },
  { name: 'Beijing', countryCode: 'CN' },
  { name: 'Bogotá', countryCode: 'CO' },
  { name: 'Moroni', countryCode: 'KM' },
  { name: 'Brazzaville', countryCode: 'CG' },
  { name: 'San José', countryCode: 'CR' },
  { name: 'Zagreb', countryCode: 'HR' },
  { name: 'Havana', countryCode: 'CU' },
  { name: 'Nicosia', countryCode: 'CY' },
  { name: 'Prague', countryCode: 'CZ' },
  { name: 'Copenhagen', countryCode: 'DK' },
  { name: 'Djibouti', countryCode: 'DJ' },
  { name: 'Roseau', countryCode: 'DM' },
  { name: 'Santo Domingo', countryCode: 'DO' },
  { name: 'Quito', countryCode: 'EC' },
  { name: 'Cairo', countryCode: 'EG' },
  { name: 'San Salvador', countryCode: 'SV' },
  { name: 'Malabo', countryCode: 'GQ' },
  { name: 'Asmara', countryCode: 'ER' },
  { name: 'Tallinn', countryCode: 'EE' },
  { name: 'Mbabane', countryCode: 'SZ' },
  { name: 'Addis Ababa', countryCode: 'ET' },
  { name: 'Suva', countryCode: 'FJ' },
  { name: 'Helsinki', countryCode: 'FI' },
  { name: 'Paris', countryCode: 'FR' },
  { name: 'Libreville', countryCode: 'GA' },
  { name: 'Banjul', countryCode: 'GM' },
  { name: 'Tbilisi', countryCode: 'GE' },
  { name: 'Berlin', countryCode: 'DE' },
  { name: 'Accra', countryCode: 'GH' },
  { name: 'Athens', countryCode: 'GR' },
  { name: 'St. George\'s', countryCode: 'GD' },
  { name: 'Guatemala City', countryCode: 'GT' },
  { name: 'Conakry', countryCode: 'GN' },
  { name: 'Bissau', countryCode: 'GW' },
  { name: 'Georgetown', countryCode: 'GY' },
  { name: 'Port-au-Prince', countryCode: 'HT' },
  { name: 'Tegucigalpa', countryCode: 'HN' },
  { name: 'Budapest', countryCode: 'HU' },
  { name: 'Reykjavik', countryCode: 'IS' },
  { name: 'New Delhi', countryCode: 'IN' },
  { name: 'Jakarta', countryCode: 'ID' },
  { name: 'Tehran', countryCode: 'IR' },
  { name: 'Baghdad', countryCode: 'IQ' },
  { name: 'Dublin', countryCode: 'IE' },
  { name: 'Jerusalem', countryCode: 'IL' },
  { name: 'Rome', countryCode: 'IT' },
  { name: 'Yamoussoukro', countryCode: 'CI' },
  { name: 'Kingston', countryCode: 'JM' },
  { name: 'Tokyo', countryCode: 'JP' },
  { name: 'Amman', countryCode: 'JO' },
  { name: 'Astana', countryCode: 'KZ' },
  { name: 'Nairobi', countryCode: 'KE' },
  { name: 'Tarawa', countryCode: 'KI' },
  { name: 'Pyongyang', countryCode: 'KP' },
  { name: 'Seoul', countryCode: 'KR' },
  { name: 'Kuwait City', countryCode: 'KW' },
  { name: 'Bishkek', countryCode: 'KG' },
  { name: 'Vientiane', countryCode: 'LA' },
  { name: 'Riga', countryCode: 'LV' },
  { name: 'Beirut', countryCode: 'LB' },
  { name: 'Maseru', countryCode: 'LS' },
  { name: 'Monrovia', countryCode: 'LR' },
  { name: 'Tripoli', countryCode: 'LY' },
  { name: 'Vaduz', countryCode: 'LI' },
  { name: 'Vilnius', countryCode: 'LT' },
  { name: 'Luxembourg City', countryCode: 'LU' },
  { name: 'Antananarivo', countryCode: 'MG' },
  { name: 'Lilongwe', countryCode: 'MW' },
  { name: 'Kuala Lumpur', countryCode: 'MY' },
  { name: 'Malé', countryCode: 'MV' },
  { name: 'Bamako', countryCode: 'ML' },
  { name: 'Valletta', countryCode: 'MT' },
  { name: 'Majuro', countryCode: 'MH' },
  { name: 'Nouakchott', countryCode: 'MR' },
  { name: 'Port Louis', countryCode: 'MU' },
  { name: 'Mexico City', countryCode: 'MX' },
  { name: 'Palikir', countryCode: 'FM' },
  { name: 'Chișinău', countryCode: 'MD' },
  { name: 'Monaco', countryCode: 'MC' },
  { name: 'Ulaanbaatar', countryCode: 'MN' },
  { name: 'Podgorica', countryCode: 'ME' },
  { name: 'Rabat', countryCode: 'MA' },
  { name: 'Maputo', countryCode: 'MZ' },
  { name: 'Windhoek', countryCode: 'NA' },
  { name: 'Naypyidaw', countryCode: 'MM' },
  { name: 'Kathmandu', countryCode: 'NP' },
  { name: 'Amsterdam', countryCode: 'NL' },
  { name: 'Wellington', countryCode: 'NZ' },
  { name: 'Managua', countryCode: 'NI' },
  { name: 'Niamey', countryCode: 'NE' },
  { name: 'Abuja', countryCode: 'NG' },
  { name: 'Oslo', countryCode: 'NO' },
  { name: 'Muscat', countryCode: 'OM' },
  { name: 'Islamabad', countryCode: 'PK' },
  { name: 'Ngerulmud', countryCode: 'PW' },
  { name: 'Panama City', countryCode: 'PA' },
  { name: 'Port Moresby', countryCode: 'PG' },
  { name: 'Asunción', countryCode: 'PY' },
  { name: 'Lima', countryCode: 'PE' },
  { name: 'Manila', countryCode: 'PH' },
  { name: 'Warsaw', countryCode: 'PL' },
  { name: 'Lisbon', countryCode: 'PT' },
  { name: 'Doha', countryCode: 'QA' },
  { name: 'Bucharest', countryCode: 'RO' },
  { name: 'Moscow', countryCode: 'RU' },
  { name: 'Kigali', countryCode: 'RW' },
  { name: 'Basseterre', countryCode: 'KN' },
  { name: 'Castries', countryCode: 'LC' },
  { name: 'Kingstown', countryCode: 'VC' },
  { name: 'Apia', countryCode: 'WS' },
  { name: 'San Marino', countryCode: 'SM' },
  { name: 'São Tomé', countryCode: 'ST' },
  { name: 'Riyadh', countryCode: 'SA' },
  { name: 'Dakar', countryCode: 'SN' },
  { name: 'Belgrade', countryCode: 'RS' },
  { name: 'Victoria', countryCode: 'SC' },
  { name: 'Freetown', countryCode: 'SL' },
  { name: 'Singapore', countryCode: 'SG' },
  { name: 'Bratislava', countryCode: 'SK' },
  { name: 'Ljubljana', countryCode: 'SI' },
  { name: 'Mogadishu', countryCode: 'SO' },
  { name: 'Pretoria', countryCode: 'ZA' },
  { name: 'Madrid', countryCode: 'ES' },
  { name: 'Colombo', countryCode: 'LK' },
  { name: 'Khartoum', countryCode: 'SD' },
  { name: 'Paramaribo', countryCode: 'SR' },
  { name: 'Stockholm', countryCode: 'SE' },
  { name: 'Bern', countryCode: 'CH' },
  { name: 'Damascus', countryCode: 'SY' },
  { name: 'Taipei', countryCode: 'TW' },
  { name: 'Dushanbe', countryCode: 'TJ' },
  { name: 'Dar es Salaam', countryCode: 'TZ' },
  { name: 'Bangkok', countryCode: 'TH' },
  { name: 'Lome', countryCode: 'TG' },
  { name: 'Nuku\'alofa', countryCode: 'TO' },
  { name: 'Port of Spain', countryCode: 'TT' },
  { name: 'Tunis', countryCode: 'TN' },
  { name: 'Ankara', countryCode: 'TR' },
  { name: 'Ashgabat', countryCode: 'TM' },
  { name: 'Funafuti', countryCode: 'TV' },
  { name: 'Kampala', countryCode: 'UG' },
  { name: 'Kyiv', countryCode: 'UA' },
  { name: 'Abu Dhabi', countryCode: 'AE' },
  { name: 'London', countryCode: 'GB' },
  { name: 'Washington, D.C.', countryCode: 'US' },
  { name: 'Montevideo', countryCode: 'UY' },
  { name: 'Tashkent', countryCode: 'UZ' },
  { name: 'Port Vila', countryCode: 'VU' },
  { name: 'Vatican City', countryCode: 'VA' },
  { name: 'Caracas', countryCode: 'VE' },
  { name: 'Hanoi', countryCode: 'VN' },
  { name: 'Sanaa', countryCode: 'YE' },
  { name: 'Lusaka', countryCode: 'ZM' },
  { name: 'Harare', countryCode: 'ZW' },
];

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

// First, add all capitals that exist in the dataset
for (const capital of WORLD_CAPITALS) {
  const found = allTheCities.find(
    (city) => 
      city.country === capital.countryCode && 
      normalizeName(city.name).toLowerCase() === capital.name.toLowerCase()
  );

  if (!found) {
    continue;
  }

  const name = normalizeName(found.name);
  const key = `${name.toLowerCase()}|${found.country}`;

  if (seen.has(key)) {
    continue;
  }

  const [longitude, latitude] = found.loc.coordinates;
  let timezone = '';

  try {
    timezone = tzlookup(latitude, longitude);
  } catch {
    continue;
  }

  const country = regionNames.of(found.country) ?? found.country;
  const aliases = pickAliases(name, found.altName);

  deduped.push({
    name,
    country,
    countryCode: found.country,
    timezone,
    flag: codeToFlag(found.country),
    ...(aliases.length > 0 ? { aliases } : {}),
  });

  seen.add(key);
}

// Then add the rest of the top cities
for (const city of topCities) {
  const name = normalizeName(city.name);
  const key = `${name.toLowerCase()}|${city.country}`;

  if (seen.has(key)) {
    continue;
  }

  const [longitude, latitude] = city.loc.coordinates;
  let timezone = '';

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
