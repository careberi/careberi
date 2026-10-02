import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone } from "./validation.mjs";

test("normalizePhone strips a leading 1 from an 11-digit number", () => {
  assert.equal(normalizePhone("+1 201 555 0123"), "2015550123");
});
