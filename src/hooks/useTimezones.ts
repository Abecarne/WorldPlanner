import { DateTime } from "luxon";
import { useMemo } from "react";
import type { City } from "../data/cities";
import {
  formatDifference,
  formatUtcOffset,
  getWorkWindow,
} from "../utils/time";

export interface CityMeetingInfo {
  city: City;
  localDateTime: DateTime;
  time24: string;
  time12: string;
  utcOffsetLabel: string;
  differenceLabel: string;
  differenceMinutes: number;
  workWindow: "green" | "yellow" | "red";  dayDifference: -1 | 0 | 1;}

interface UseTimezonesInput {
  selectedCities: City[];
  referenceCityId: string | null;
  date: string;
  time: string;
}

export interface UseTimezonesOutput {
  referenceCity: City | null;
  referenceDateTime: DateTime | null;
  rows: CityMeetingInfo[];
}

export function useTimezones({
  selectedCities,
  referenceCityId,
  date,
  time,
}: UseTimezonesInput): UseTimezonesOutput {
  return useMemo(() => {
    const referenceCity =
      selectedCities.find((city) => city.id === referenceCityId) ??
      selectedCities[0] ??
      null;

    if (!referenceCity) {
      return {
        referenceCity: null,
        referenceDateTime: null,
        rows: [],
      };
    }

    const referenceDateTime = DateTime.fromISO(`${date}T${time}`, {
      zone: referenceCity.timezone,
    });

    if (!referenceDateTime.isValid) {
      return {
        referenceCity,
        referenceDateTime: null,
        rows: [],
      };
    }

    const rows = selectedCities
      .map((city): CityMeetingInfo => {
        const localDateTime = referenceDateTime.setZone(city.timezone);
        const differenceMinutes =
          localDateTime.offset - referenceDateTime.offset;

        const referenceDayOfYear = referenceDateTime.ordinal;
        const localDayOfYear = localDateTime.ordinal;
        const dayDifference = (localDayOfYear - referenceDayOfYear) as -1 | 0 | 1;

        return {
          city,
          localDateTime,
          time24: localDateTime.toFormat('HH:mm'),
          time12: localDateTime.toFormat('hh:mm a'),
          utcOffsetLabel: formatUtcOffset(localDateTime.offset),
          differenceLabel: formatDifference(differenceMinutes),
          differenceMinutes,
          workWindow: getWorkWindow(localDateTime),
          dayDifference: dayDifference > 1 ? 1 : dayDifference < -1 ? -1 : dayDifference,
        };
      })
      .sort((first, second) => {
        const absoluteDifference =
          Math.abs(first.differenceMinutes) -
          Math.abs(second.differenceMinutes);

        if (absoluteDifference !== 0) {
          return absoluteDifference;
        }

        if (first.differenceMinutes !== second.differenceMinutes) {
          return first.differenceMinutes - second.differenceMinutes;
        }

        return first.city.name.localeCompare(second.city.name, "en");
      });

    return {
      referenceCity,
      referenceDateTime,
      rows,
    };
  }, [date, referenceCityId, selectedCities, time]);
}
