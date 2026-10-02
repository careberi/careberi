// A speed bump, not a defence. Per-process and reset on restart, which is the
// right trade at this volume — a shared store would be disproportionate.
// Exported mutable so tests can raise the ceiling.

export const RATE_LIMIT = { max: 5, windowMs: 600000 };

const hits = new Map();

export function resetRateLimit() {
  hits.clear();
}

export function checkRateLimit(ip, now = Date.now()) {
  const key = String(ip ?? "");
  const recent = (hits.get(key) ?? []).filter(
    (t) => now - t < RATE_LIMIT.windowMs
  );
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
