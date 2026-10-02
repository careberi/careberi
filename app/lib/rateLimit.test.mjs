import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, resetRateLimit, RATE_LIMIT, parseClientIp, hitsSize } from "./rateLimit.mjs";

test("allows up to max then blocks, per IP", () => {
  resetRateLimit();
  for (let i = 0; i < RATE_LIMIT.max; i++)
    assert.equal(checkRateLimit("1.1.1.1"), true, "attempt " + i);
  assert.equal(checkRateLimit("1.1.1.1"), false);
  assert.equal(checkRateLimit("2.2.2.2"), true, "other IP unaffected");
});

test("the window slides", () => {
  resetRateLimit();
  const t0 = Date.now();
  for (let i = 0; i < RATE_LIMIT.max; i++) checkRateLimit("3.3.3.3", t0);
  assert.equal(checkRateLimit("3.3.3.3", t0), false);
  assert.equal(checkRateLimit("3.3.3.3", t0 + RATE_LIMIT.windowMs + 1), true);
});

test("the defaults leave room for the client's retry loop", () => {
  // The client retries a failed send up to 3x, so a 5-hit ceiling would lock a
  // visitor out after one failure. 15 = 5 logical submissions per 10 minutes.
  assert.equal(RATE_LIMIT.max, 15);
  assert.equal(RATE_LIMIT.windowMs, 600000);
});

test("a missing IP is still rate limited rather than bypassing", () => {
  resetRateLimit();
  for (let i = 0; i < RATE_LIMIT.max; i++) checkRateLimit("");
  assert.equal(checkRateLimit(""), false);
});

test("parseClientIp takes the proxy-appended rightmost hop, not the client's claim", () => {
  // A client can prepend anything; only the rightmost entry was added by our proxy.
  assert.equal(parseClientIp("1.2.3.4, 9.9.9.9"), "9.9.9.9");
  assert.equal(parseClientIp("203.0.113.5"), "203.0.113.5");
  assert.equal(parseClientIp("  1.1.1.1 ,  2.2.2.2  "), "2.2.2.2");
  assert.equal(parseClientIp(""), "");
  assert.equal(parseClientIp(null), "");
});

test("the hits map is bounded, so spoofed keys cannot grow it without limit", () => {
  resetRateLimit();
  for (let i = 0; i < RATE_LIMIT.maxKeys + 500; i++) checkRateLimit("ip-" + i);
  assert.ok(
    hitsSize() <= RATE_LIMIT.maxKeys,
    "map size " + hitsSize() + " should stay within " + RATE_LIMIT.maxKeys
  );
});

test("expired keys are reclaimed, not just the one being read", () => {
  resetRateLimit();
  const t0 = Date.now();
  for (let i = 0; i < 50; i++) checkRateLimit("old-" + i, t0);
  assert.equal(hitsSize(), 50);
  checkRateLimit("fresh", t0 + RATE_LIMIT.windowMs + 1);
  assert.equal(hitsSize(), 1, "stale keys dropped on the next call");
});
