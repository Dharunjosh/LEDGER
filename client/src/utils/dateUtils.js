/**
 * Date/time helpers shared across the Reminder feature.
 */

// Combine a "YYYY-MM-DD" date string and "HH:MM" time string into a Date.
export function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = timeStr && timeStr.length > 0 ? timeStr : '00:00';
  return new Date(`${dateStr}T${time}`);
}

// Human friendly label, e.g. "Today, 4:30 PM" / "Tomorrow, 9:00 AM" / "Aug 12, 9:00 AM"
export function formatReminderDateTime(dateStr, timeStr) {
  const target = combineDateTime(dateStr, timeStr);
  if (!target || Number.isNaN(target.getTime())) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayDiff = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));

  const timeLabel = target.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (dayDiff === 0) return `Today, ${timeLabel}`;
  if (dayDiff === 1) return `Tomorrow, ${timeLabel}`;
  if (dayDiff === -1) return `Yesterday, ${timeLabel}`;

  const dateLabel = target.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
  return `${dateLabel}, ${timeLabel}`;
}

// A reminder counts as "upcoming" if it falls within the next 24 hours
// (and hasn't already passed).
export function isUpcoming(dateStr, timeStr, windowHours = 24) {
  const target = combineDateTime(dateStr, timeStr);
  if (!target || Number.isNaN(target.getTime())) return false;
  const now = new Date();
  const diffHours = (target - now) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= windowHours;
}

export function isPast(dateStr, timeStr) {
  const target = combineDateTime(dateStr, timeStr);
  if (!target || Number.isNaN(target.getTime())) return false;
  return target.getTime() < Date.now();
}

// Today's date as "YYYY-MM-DD", used as a default/min value for the date input.
export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
