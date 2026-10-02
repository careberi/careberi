// A speed bump, not a defence. Per-process and reset on restart, which is the
// right trade at this volume — a shared store would be disproportionate.
// Exported mutable so tests can raise the ceiling.

export const RATE_LIMIT = { max: 15, windowMs: 600000, maxKeys: 5000 };

const hits = new Map();

export function resetRateLimit() {
  hits.clear();
}

export function hitsSize() {
  return hits.size;
}

// A client can prepend anything to X-Forwarded-For; only the rightmost entry was
// appended by our own proxy, so the leftmost is attacker-controlled and useless.
export function parseClientIp(forwardedFor) {
  const parts = String(forwardedFor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function prune(now) {
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < RATE_LIMIT.windowMs);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }
}

export function checkRateLimit(ip, now = Date.now()) {
  // Prune the whole map, not just this key: spoofed keys would otherwise
  // accumulate forever in a long-lived process.
  prune(now);
  if (hits.size >= RATE_LIMIT.maxKeys) hits.clear();

  const key = String(ip ?? "");
  const recent = hits.get(key) ?? [];
  if (recent.length >= RATE_LIMIT.max) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}
