import type { CityMeetingInfo } from "../hooks/useTimezones";
import type { TimeFormat } from "../utils/time";

interface CityCardProps {
  row: CityMeetingInfo;
  isReference: boolean;
  timeFormat: TimeFormat;
}

const workWindowLabels: Record<CityMeetingInfo["workWindow"], string> = {
  green: "Travail",
  yellow: "Acceptable",
  red: "Nuit",
};

export function CityCard({ row, isReference, timeFormat }: CityCardProps) {
  return (
    <article className="city-card" data-window={row.workWindow}>
      <header>
        <div>
          <h3>
            {row.city.flag} {row.city.name}
          </h3>
          <p>{row.city.country}</p>
        </div>
        <div className="card-badges">
          {isReference ? <span className="reference-pill">Reference</span> : null}
          {row.dayDifference !== 0 && (
            <span className="day-badge" title={row.dayDifference > 0 ? "Jour suivant" : "Jour precedent"}>
              {row.dayDifference > 0 ? "+1 jour" : "-1 jour"}
            </span>
          )}
        </div>
      </header>

      <div className="time-value">
        {timeFormat === "24h" ? row.time24 : row.time12}
      </div>

      <dl>
        <div>
          <dt>Fuseau</dt>
          <dd>{row.utcOffsetLabel}</dd>
        </div>
        <div>
          <dt>Decalage</dt>
          <dd>{row.differenceLabel}</dd>
        </div>
      </dl>

      <span className="status-badge" data-window={row.workWindow}>
        {workWindowLabels[row.workWindow]}
      </span>
    </article>
  );
}
