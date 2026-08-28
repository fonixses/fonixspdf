const requests = new Map<string, number[]>();
const WINDOW = 10 * 60_000;
const LIMIT = 30;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const recent = (requests.get(key) ?? []).filter((time) => now - time < WINDOW);
  if (recent.length >= LIMIT) return false;
  recent.push(now); requests.set(key, recent);
  if (requests.size > 2_000) {
    for (const [entry, times] of requests) if (!times.some((time) => now - time < WINDOW)) requests.delete(entry);
  }
  return true;
}
