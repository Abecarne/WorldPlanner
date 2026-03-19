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
        {isReference ? <span className="reference-pill">Reference</span> : null}
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
