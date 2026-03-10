import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maskValue(value: string, visibleChars: number = 4) {
  if (!value) return "";
  if (value.length <= visibleChars) return value;
  return value.substring(0, visibleChars) + "*".repeat(value.length - visibleChars);
}
