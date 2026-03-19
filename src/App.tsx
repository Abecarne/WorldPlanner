import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, X } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { CityCard } from "./components/CityCard";
import { CitySearch } from "./components/CitySearch";
import { DateTimePicker } from "./components/DateTimePicker";
import { ShareButtons } from "./components/ShareButtons";
import { TimeSlider } from "./components/TimeSlider";
import { loadCities, type City } from "./data/cities";
import { useTimezones } from "./hooks/useTimezones";
import {
  formatReadableMeeting,
  isValidDate,
  isValidTime,
  roundToQuarterHour,
  toHourMinute,
  type TimeFormat,
} from "./utils/time";

type Theme = "dark" | "light";

const MAX_CITIES = 10;

interface InitialUrlState {
  date: string;
  time: string;
  timeFormat: TimeFormat;
  theme: Theme;
  cityIds: string[];
  referenceCityId: string | null;
}

function readInitialUrlState(
  fallbackDate: string,
  fallbackTime: string,
): InitialUrlState {
  if (typeof window === "undefined") {
    return {
      date: fallbackDate,
      time: fallbackTime,
      timeFormat: "24h",
      theme: "dark",
      cityIds: [],
      referenceCityId: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");
  const timeParam = params.get("time");
  const formatParam = params.get("fmt");
  const themeParam = params.get("theme");

  return {
    date: dateParam && isValidDate(dateParam) ? dateParam : fallbackDate,
    time: timeParam && isValidTime(timeParam) ? timeParam : fallbackTime,
    timeFormat:
      formatParam === "12h" || formatParam === "24h" ? formatParam : "24h",
    theme:
      themeParam === "light" || themeParam === "dark" ? themeParam : "dark",
    cityIds:
      params
        .get("cities")
        ?.split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .slice(0, MAX_CITIES) ?? [],
    referenceCityId: params.get("ref"),
  };
}

function buildQueryString(options: {
  selectedCityIds: string[];
  referenceCityId: string | null;
  date: string;
  time: string;
  timeFormat: TimeFormat;
  theme: Theme;
}): string {
  const params = new URLSearchParams();

  if (options.selectedCityIds.length > 0) {
    params.set("cities", options.selectedCityIds.join(","));
  }

  params.set("date", options.date);
  params.set("time", options.time);
  params.set("fmt", options.timeFormat);
  params.set("theme", options.theme);

  if (options.referenceCityId) {
    params.set("ref", options.referenceCityId);
  }

  return params.toString();
}

function App() {
  const now = useMemo(() => roundToQuarterHour(DateTime.local()), []);
  const [initialUrlState] = useState(() => {
    return readInitialUrlState(
      now.toISODate() ?? "2026-03-19",
      now.toFormat("HH:mm"),
    );
  });

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [referenceCityId, setReferenceCityId] = useState<string | null>(null);
  const [date, setDate] = useState(initialUrlState.date);
  const [time, setTime] = useState(initialUrlState.time);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(
    initialUrlState.timeFormat,
  );
  const [theme, setTheme] = useState<Theme>(initialUrlState.theme);

  const initializedRef = useRef(false);

  const citiesById = useMemo(() => {
    return new Map(cities.map((city) => [city.id, city]));
  }, [cities]);

  const selectedCities = useMemo(() => {
    return selectedCityIds
      .map((id) => citiesById.get(id))
      .filter((city): city is City => city !== undefined);
  }, [citiesById, selectedCityIds]);

  useEffect(() => {
    let cancelled = false;

    loadCities()
      .then((loadedCities) => {
        if (cancelled) {
          return;
        }

        setCities(loadedCities);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setError("Impossible de charger les villes.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cities.length === 0 || initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    let nextSelectedIds = initialUrlState.cityIds.filter((id) =>
      citiesById.has(id),
    );

    if (nextSelectedIds.length === 0) {
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localCity = cities.find((city) => city.timezone === localTimezone);
      if (localCity) {
        nextSelectedIds = [localCity.id];
      }
    }

    if (nextSelectedIds.length === 0 && cities.length > 0) {
      nextSelectedIds = [cities[0].id];
    }

    setSelectedCityIds(nextSelectedIds);

    if (
      initialUrlState.referenceCityId &&
      nextSelectedIds.includes(initialUrlState.referenceCityId)
    ) {
      setReferenceCityId(initialUrlState.referenceCityId);
    } else {
      setReferenceCityId(nextSelectedIds[0] ?? null);
    }
  }, [
    cities,
    citiesById,
    initialUrlState.cityIds,
    initialUrlState.referenceCityId,
  ]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const effectiveReferenceCityId =
    referenceCityId && selectedCityIds.includes(referenceCityId)
      ? referenceCityId
      : (selectedCityIds[0] ?? null);

  const { referenceCity, referenceDateTime, rows } = useTimezones({
    selectedCities,
    referenceCityId: effectiveReferenceCityId,
    date,
    time,
  });

  const previewMeetingDateTime = useMemo(() => {
    const zone =
      referenceCity?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parsed = DateTime.fromISO(`${date}T${time}`, { zone });
    return parsed.isValid ? parsed : null;
  }, [date, referenceCity?.timezone, time]);

  const [hourText, minuteText] = time.split(":");
  const currentHour = Number(hourText) || 0;
  const currentMinute = Number(minuteText) || 0;

  const favorableCount = rows.filter((row) => row.workWindow !== "red").length;
  const allGreenOrYellow = rows.length > 0 && favorableCount === rows.length;

  const queryString = useMemo(
    () =>
      buildQueryString({
        selectedCityIds,
        referenceCityId: effectiveReferenceCityId,
        date,
        time,
        timeFormat,
        theme,
      }),
    [date, effectiveReferenceCityId, selectedCityIds, theme, time, timeFormat],
  );

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }, [queryString]);

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.search = queryString;
    return url.toString();
  }, [queryString]);

  const markdownSummary = useMemo(() => {
    if (!referenceDateTime || !referenceCity || rows.length === 0) {
      return "Aucune ville selectionnee.";
    }

    const lines = [
      `📅 Reunion : ${formatReadableMeeting(referenceDateTime)} (${referenceCity.name})`,
      ...rows.map((row) => {
        let dayLabel = '';
        if (row.dayDifference > 0) {
          dayLabel = ' (+1 jour)';
        } else if (row.dayDifference < 0) {
          dayLabel = ' (-1 jour)';
        }
        return `🌍 ${row.city.name} — ${row.time24} (${row.utcOffsetLabel})${dayLabel}`;
      }),
    ];

    return lines.join("\n");
  }, [referenceCity, referenceDateTime, rows]);

  const addCity = (city: City) => {
    setSelectedCityIds((previous) => {
      if (previous.includes(city.id) || previous.length >= MAX_CITIES) {
        return previous;
      }

      return [...previous, city.id];
    });
  };

  const removeCity = (cityId: string) => {
    setSelectedCityIds((previous) => previous.filter((id) => id !== cityId));

    if (referenceCityId === cityId) {
      setReferenceCityId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Chargement de WorldPlanner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">WorldPlanner</p>
          <h1>Planifier des reunions mondiales sans calcul mental</h1>
          <p>
            Choisissez vos villes, votre timezone de reference et visualisez en
            direct les horaires confortables.
          </p>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
          aria-label="Changer de theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Clair" : "Sombre"}
        </button>
      </header>

      <section className="panel">
        <h2>1. Selection de villes</h2>
        <CitySearch
          cities={cities}
          selectedCities={selectedCities}
          currentMeeting={previewMeetingDateTime}
          onAddCity={addCity}
          maxCities={MAX_CITIES}
        />

        <div className="chips">
          <AnimatePresence>
            {selectedCities.map((city) => (
              <motion.button
                key={city.id}
                type="button"
                className="chip"
                onClick={() => removeCity(city.id)}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                {city.flag} {city.name}
                <X size={14} aria-hidden="true" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <DateTimePicker
        date={date}
        time={time}
        selectedCities={selectedCities}
        referenceCityId={effectiveReferenceCityId}
        timeFormat={timeFormat}
        onDateChange={setDate}
        onTimeChange={setTime}
        onReferenceCityChange={(cityId) => setReferenceCityId(cityId || null)}
        onTimeFormatChange={setTimeFormat}
      />

      <section className="panel">
        <h2>3. Tableau des fuseaux horaires</h2>
        {rows.length === 0 ? (
          <p className="hint">
            Ajoutez au moins une ville pour afficher les horaires.
          </p>
        ) : (
          <div className="cards-grid">
            <AnimatePresence>
              {rows.map((row) => (
                <motion.div
                  key={row.city.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.22 }}
                >
                  <CityCard
                    row={row}
                    isReference={row.city.id === referenceCity?.id}
                    timeFormat={timeFormat}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <TimeSlider
        hour={currentHour}
        onHourChange={(nextHour) => {
          setTime(toHourMinute(nextHour, currentMinute));
        }}
      />

      <p
        className={allGreenOrYellow ? "slot-feedback ok" : "slot-feedback warn"}
      >
        {allGreenOrYellow
          ? `Excellent creneau: ${favorableCount}/${rows.length} villes sont en vert ou jaune.`
          : `Creneau a optimiser: ${favorableCount}/${rows.length} villes sont en vert ou jaune.`}
      </p>

      <ShareButtons shareUrl={shareUrl} summary={markdownSummary} />
    </div>
  );
}

export default App;
