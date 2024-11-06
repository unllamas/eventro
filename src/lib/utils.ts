import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createUnixTimestamp = (
  date: Date,
  timeString?: string
): number => {
  if (!timeString) return Math.floor(date.getTime() / 1000);

  const [hours, minutes] = timeString.split(':').map(Number);

  const newDate = new Date(date);
  newDate.setHours(hours, minutes);

  return Math.floor(newDate.getTime() / 1000);
};
