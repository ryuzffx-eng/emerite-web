import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIST(dateStr?: string | Date, options: Intl.DateTimeFormatOptions = {}) {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === 'string'
      ? new Date(dateStr.includes('T') ? (dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`) : (dateStr.includes(' ') ? `${dateStr.replace(' ', 'T')}Z` : `${dateStr}T00:00:00Z`))
      : dateStr;

    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      ...options
    });
  } catch (e) {
    return "—";
  }
}