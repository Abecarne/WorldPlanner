import { Search } from "lucide-react";
import { DateTime } from "luxon";
import { type KeyboardEventHandler, useMemo, useState } from "react";
import type { City } from "../data/cities";
import { normalizeQuery } from "../data/cities";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatUtcOffset } from "../utils/time";

interface CitySearchProps {
  cities: City[];
  selectedCities: City[];
  currentMeeting: DateTime | null;
  onAddCity: (city: City) => void;
  maxCities?: number;
}

const MAX_SUGGESTIONS = 8;

function getPriority(city: City, query: string): number {
  if (!query) {
    return 0;
  }

  const lowerName = normalizeQuery(city.name);

  if (lowerName.startsWith(query)) {
    return 2;
  }

  if (lowerName.includes(query)) {
    return 1;
  }

  return 0;
}

export function CitySearch({
  cities,
  selectedCities,
  currentMeeting,
  onAddCity,
  maxCities = 10,
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 300);

  const selectedIds = useMemo(
    () => new Set(selectedCities.map((city) => city.id)),
    [selectedCities],
  );
  const canAddMore = selectedCities.length < maxCities;

  const suggestions = useMemo(() => {
    const searchableCities = cities.filter((city) => !selectedIds.has(city.id));
    const normalized = normalizeQuery(debouncedQuery);

    if (!normalized) {
      return searchableCities.slice(0, MAX_SUGGESTIONS);
    }

    return searchableCities
      .filter((city) => city.searchIndex.includes(normalized))
      .sort((first, second) => {
        const priorityDifference =
          getPriority(second, normalized) - getPriority(first, normalized);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return first.name.localeCompare(second.name, "en");
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [cities, debouncedQuery, selectedIds]);

  const isDropdownVisible = focused && canAddMore && suggestions.length > 0;

  const addCity = (city: City) => {
    if (!canAddMore) {
      return;
    }

    onAddCity(city);
    setQuery("");
    setActiveIndex(0);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!isDropdownVisible) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const city = suggestions[activeIndex];
      if (city) {
        addCity(city);
      }
    }

    if (event.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <div className="city-search">
      <label className="label" htmlFor="city-search-input">
        Ajouter des villes (max {maxCities})
      </label>
      <div className="search-input-wrapper">
        <Search size={16} aria-hidden="true" />
        <input
          id="city-search-input"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 120);
          }}
          placeholder={
            canAddMore
              ? "Ex: Paris, Tokyo, New York, Londres..."
              : "Limite de villes atteinte"
          }
          disabled={!canAddMore}
          role="combobox"
          aria-expanded={isDropdownVisible}
          aria-controls="city-search-list"
          aria-autocomplete="list"
        />
      </div>

      {isDropdownVisible ? (
        <ul className="suggestions" id="city-search-list" role="listbox">
          {suggestions.map((city, index) => {
            const meeting = (currentMeeting ?? DateTime.now()).setZone(
              city.timezone,
            );
            const active = index === activeIndex;

            return (
              <li key={city.id} role="option" aria-selected={active}>
                <button
                  className={active ? "suggestion active" : "suggestion"}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addCity(city)}
                >
                  <span>
                    {city.flag} {city.name}, {city.country}
                  </span>
                  <span>{formatUtcOffset(meeting.offset)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!canAddMore ? (
        <p className="hint">Vous avez atteint la limite de 10 villes.</p>
      ) : null}
    </div>
  );
}
