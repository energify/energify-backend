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
