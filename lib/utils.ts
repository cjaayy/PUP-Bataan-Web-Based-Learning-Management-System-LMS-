import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function greetingByTime(name: string) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${part}, ${name}`;
}

export function createCourseCode(title: string) {
  const prefix = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix || "CLS"}-${rand}`;
}
