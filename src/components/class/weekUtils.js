/** Local-calendar week helpers (weeks start on Monday). */

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday (local) of the week containing `date`. */
export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

export function shortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** `YYYY-MM-DD` → local Date. */
export function parseDayKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** "11/23 – 11/29" for a week starting at `weekStartKey`. */
export function weekRangeLabel(weekStartKey) {
  const start = parseDayKey(weekStartKey);
  return `${shortDate(start)} – ${shortDate(addDays(start, 6))}`;
}
