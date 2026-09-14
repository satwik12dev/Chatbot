import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function groupConversationsByDate<T extends { updatedAt?: string; createdAt?: string }>(
  conversations: T[]
): {
  today: T[];
  yesterday: T[];
  previous7Days: T[];
  older: T[];
} {
  const today: T[] = [];
  const yesterday: T[] = [];
  const previous7Days: T[] = [];
  const older: T[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7DaysAgo = startOfToday - 7 * 86400000;

  for (const conv of conversations) {
    const timestamp = new Date(conv.updatedAt || conv.createdAt || Date.now()).getTime();
    if (timestamp >= startOfToday) {
      today.push(conv);
    } else if (timestamp >= startOfYesterday) {
      yesterday.push(conv);
    } else if (timestamp >= startOf7DaysAgo) {
      previous7Days.push(conv);
    } else {
      older.push(conv);
    }
  }

  return { today, yesterday, previous7Days, older };
}
