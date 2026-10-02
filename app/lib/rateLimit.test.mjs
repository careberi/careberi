import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, resetRateLimit, RATE_LIMIT } from "./rateLimit.mjs";

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

test("the defaults are 5 per 10 minutes", () => {
  assert.equal(RATE_LIMIT.max, 5);
  assert.equal(RATE_LIMIT.windowMs, 600000);
});

test("a missing IP is still rate limited rather than bypassing", () => {
  resetRateLimit();
  for (let i = 0; i < RATE_LIMIT.max; i++) checkRateLimit("");
  assert.equal(checkRateLimit(""), false);
});
