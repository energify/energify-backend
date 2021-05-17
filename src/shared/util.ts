import { format } from "date-fns";
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

export function intervalToHours(interval: "1h" | "1d" | "1w" | "1m" | "1y") {
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
