import { DateTime } from "luxon";

export type TimeFormat = "24h" | "12h";
export type WorkWindow = "green" | "yellow" | "red";

export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }

  return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function formatDifference(offsetMinutes: number): string {
  if (offsetMinutes === 0) {
    return "0h";
  }

  const sign = offsetMinutes > 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  if (minutes === 0) {
    return `${sign}${hours}h`;
  }

  return `${sign}${hours}h${minutes.toString().padStart(2, "0")}`;
}

export function getWorkWindow(time: DateTime): WorkWindow {
  const minuteOfDay = time.hour * 60 + time.minute;

  if (minuteOfDay >= 8 * 60 && minuteOfDay < 19 * 60) {
    return "green";
  }

  if (
    (minuteOfDay >= 6 * 60 && minuteOfDay < 8 * 60) ||
    (minuteOfDay >= 19 * 60 && minuteOfDay < 22 * 60)
  ) {
    return "yellow";
  }

  return "red";
}

export function roundToQuarterHour(time: DateTime): DateTime {
  const remainder = time.minute % 15;
  const addMinutes = remainder === 0 ? 0 : 15 - remainder;
  return time.plus({ minutes: addMinutes }).startOf("minute");
}

export function toHourMinute(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
}

export function formatReadableMeeting(dt: DateTime): string {
  return dt.setLocale("fr").toFormat("cccc dd LLLL yyyy 'a' HH'h'mm");
}
