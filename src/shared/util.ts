import { format, subHours } from "date-fns";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export function LessThanOrEqualDate(date: Date) {
  return LessThanOrEqual(format(date, "yyyy-MM-d HH:mm:ss"));
}

export function MoreThanOrEqualDate(date: Date) {
  return MoreThanOrEqual(format(date, "yyyy-MM-d HH:mm:ss"));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), ms));
}

export function intervalToHours(interval: string) {
  if (interval === "1h") {
    return 1;
  } else if (interval === "1d") {
    return 24;
  } else if (interval === "1w") {
    return 24 * 7;
  } else if (interval === "1m") {
    return 24 * 7 * 31;
  }

  return 12 * 24 * 7;
}

export function intervalToDateRanges(interval: string, scale: number, start: Date) {
  const hours = intervalToHours(interval);
  const dateRanges = [];

  for (let i = 0; i < scale; i++) {
    dateRanges.push({ start: subHours(start, hours / scale), end: start });
    start = subHours(start, hours / scale);
  }

  return dateRanges;
}
