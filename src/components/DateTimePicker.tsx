import type { City } from "../data/cities";
import type { TimeFormat } from "../utils/time";

interface DateTimePickerProps {
  date: string;
  time: string;
  selectedCities: City[];
  referenceCityId: string | null;
  timeFormat: TimeFormat;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onReferenceCityChange: (cityId: string) => void;
  onTimeFormatChange: (value: TimeFormat) => void;
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  return value;
});

export function DateTimePicker({
  date,
  time,
  selectedCities,
  referenceCityId,
  timeFormat,
  onDateChange,
  onTimeChange,
  onReferenceCityChange,
  onTimeFormatChange,
}: DateTimePickerProps) {
  return (
    <section className="panel">
      <h2>2. Date et heure de reunion</h2>
      <div className="controls-grid">
        <label className="control-item">
          <span className="label">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>

        <label className="control-item">
          <span className="label">Heure (pas de 15 min)</span>
          <select
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
          >
            {timeOptions.map((optionValue) => (
              <option key={optionValue} value={optionValue}>
                {optionValue}
              </option>
            ))}
          </select>
        </label>

        <label className="control-item">
          <span className="label">Timezone de reference</span>
          <select
            value={referenceCityId ?? ""}
            onChange={(event) => onReferenceCityChange(event.target.value)}
            disabled={selectedCities.length === 0}
          >
            {selectedCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.flag} {city.name} ({city.timezone})
              </option>
            ))}
          </select>
        </label>

        <div className="control-item">
          <span className="label">Affichage horaire</span>
          <div
            className="format-toggle"
            role="radiogroup"
            aria-label="Format horaire"
          >
            <button
              type="button"
              className={timeFormat === "24h" ? "selected" : ""}
              onClick={() => onTimeFormatChange("24h")}
              role="radio"
              aria-checked={timeFormat === "24h"}
            >
              24h
            </button>
            <button
              type="button"
              className={timeFormat === "12h" ? "selected" : ""}
              onClick={() => onTimeFormatChange("12h")}
              role="radio"
              aria-checked={timeFormat === "12h"}
            >
              12h
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
