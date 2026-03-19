interface TimeSliderProps {
  hour: number;
  onHourChange: (hour: number) => void;
}

export function TimeSlider({ hour, onHourChange }: TimeSliderProps) {
  return (
    <section className="panel">
      <h2>4. Trouver le meilleur creneau</h2>
      <p className="hint">
        Faites glisser pour tester rapidement chaque heure de la journee.
      </p>
      <div className="slider-wrapper">
        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={hour}
          onChange={(event) => onHourChange(Number(event.target.value))}
          aria-label="Heure de la reunion"
        />
        <div className="slider-labels" aria-hidden="true">
          <span>00h</span>
          <span>06h</span>
          <span>12h</span>
          <span>18h</span>
          <span>23h</span>
        </div>
        <p className="current-hour">
          Heure testee: {hour.toString().padStart(2, "0")}h
        </p>
      </div>
    </section>
  );
}
