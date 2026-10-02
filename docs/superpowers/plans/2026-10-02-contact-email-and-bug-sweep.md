# Contact-form email delivery + bug sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dead Supabase insert path with Resend email delivery to `neil@careberi.com`, and fix the defects found in the 2026-10-02 audit of the live site.

**Architecture:** `submitContactForm` keeps its name and signature; only its persistence call changes. Two new pure modules — `app/lib/validation.mjs` (shared by client and server, ending the duplicated validators) and `app/lib/leadEmail.mjs` (`payload → {subject, html}`) — carry all the logic worth testing. Node's built-in test runner covers both with zero new dependencies.

**Tech Stack:** Next.js 15.5.25, React 19, `resend` (new), `node --test`, Playwright (existing audit scripts in `scratchpad/pw/`).

**Spec:** `docs/superpowers/specs/2026-10-02-contact-email-and-bug-sweep-design.md`

## Global Constraints

- Node's built-in runner only. Do **not** add vitest, jest, or any test dependency.
- `package.json` must **not** gain `"type": "module"`. The two shared modules are `.mjs` for this reason.
- `RESEND_API_KEY` is read from `process.env` only. It must never appear in any tracked file.
- Recipient and sender are constants in `app/lib/site.js`, not env vars.
- From address: `careberi forms <forms@send.careberi.com>` — the **subdomain**, never the apex, so Google Workspace mail for `careberi.com` is untouched.
- To address: `neil@careberi.com`. Reply-To: the submitter's email.
- ZIP: 5 digits; `07001`–`08989` required for `general` and `probono`; any 5 digits for `partner`.
- Field caps: name 120, email 254, town 200, story 5000, recipientNotes 5000, caregiverPreferences 5000. Over cap is a `validation` error, never truncation.
- Rate limit: 5 submissions per 10 minutes per IP, exported as a mutable module-scope config so tests can raise it.
- HSTS ships **without** `preload`.
- Work on a feature branch. Current branch is `main`; do not commit there.
- Leave `public/hero-family.png` and `README.md` alone.

## Review Focus

Input classes the spec implies but no task's happy path exercises. Each has a test pinned to the task that owns the code.

1. **HTML/script payloads in free-text fields.** These now flow into rendered email HTML rather than a database column. `<script>`, `"`, `&`, `<` in name, story, recipientNotes and caregiverPreferences must arrive escaped — covered in Task 3.
2. **`startDate` exactly at the America/New_York midnight boundary.** "Today" must be today in NJ, not UTC, or a late-evening ET visitor is told their start date is in the past — covered in Task 2.
3. **An 11-digit number that does not begin with 1** (e.g. `25015550123`). Must be rejected, not silently truncated to 10 — covered in Task 2.
4. **`reason` switched twice (care → partner → care).** Branch state must not resurrect care answers onto a partner lead or vice versa — covered in Task 6.
5. **A single free-text word longer than the table's column width,** with no spaces. Must not break the email table layout — covered in Task 3.

---

### Task 1: Feature branch and test harness

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` → runs `node --test`, discovering `**/*.test.mjs`.

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b contact-email-and-bug-sweep
```

- [ ] **Step 2: Add the test script**

Add `"test": "node --test"` to the `scripts` block in `package.json`. Change nothing else — in particular do not add `"type": "module"`.

- [ ] **Step 3: Write a placeholder failing test**

Create `app/lib/validation.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone } from "./validation.mjs";

test("normalizePhone strips a leading 1 from an 11-digit number", () => {
  assert.equal(normalizePhone("+1 201 555 0123"), "2015550123");
});
```

- [ ] **Step 4: Run it to verify the harness reports a real failure**

Run: `npm test`
Expected: FAIL — `Cannot find module` for `./validation.mjs`. This proves discovery works and the module genuinely does not exist yet.

- [ ] **Step 5: Commit**

```bash
git add package.json app/lib/validation.test.mjs
git commit -m "test: add node --test harness and first failing validation test"
```

---

### Task 2: `app/lib/validation.mjs` — the shared validators

**Files:**
- Create: `app/lib/validation.mjs`
- Test: `app/lib/validation.test.mjs` (extend)

**Interfaces:**
- Consumes: nothing.
- Produces, all pure, no I/O:
  - `normalizePhone(raw: string) -> string` — digits only, leading `1` dropped when the result is 11 digits
  - `isValidPhone(raw: string) -> boolean`
  - `isValidEmail(email: string) -> boolean`
  - `isValidZip(zip: string) -> boolean`
  - `isNjZip(zip: string) -> boolean`
  - `zipRequiresNj(reason: string) -> boolean`
  - `zipError(zip: string, reason: string) -> string | null`
  - `todayInNewJersey() -> string` — `YYYY-MM-DD` in `America/New_York`
  - `isValidDateString(s: string) -> boolean`
  - `FIELD_CAPS` — frozen object of the Global Constraints caps
  - `AGE_RANGES` — frozen array of the eight age-range values
  - `CARE_NEEDS`, `CARE_TYPES`, `RECIPIENTS`, `GENDERS`, `REASONS` — frozen arrays, moved here from the two files that currently each declare their own

- [ ] **Step 1: Write the failing tests**

Extend `app/lib/validation.test.mjs`. Every case below is required; the spec's exact values are in the assertions.

```js
test("isValidPhone", () => {
  for (const ok of ["2015550123", "201-555-0123", "(201) 555-0123",
                    "+1 201 555 0123", "1-201-555-0123"])
    assert.equal(isValidPhone(ok), true, ok);
  for (const bad of ["20155501", "201555012345", "abcdefghij", "0000000000",
                     "1111111111", "----------", "25015550123", "1015550123"])
    assert.equal(isValidPhone(bad), false, bad);
});

test("isValidEmail", () => {
  for (const ok of ["a@b.co", "test@example.com", "first.last@sub.example.org",
                    "x+tag@example.co.uk"])
    assert.equal(isValidEmail(ok), true, ok);
  for (const bad of ["plainword", "a@b", "a@b.c", "@example.com",
                     "a b@example.com", "a@@example.com", "a@example..com",
                     "a@-.com", "a@[127.0.0.1]", "test@example.com.",
                     "a@b.c<script>", ".a@example.com", "a.@example.com",
                     "a@example.com-", "x".repeat(250) + "@example.com"])
    assert.equal(isValidEmail(bad), false, bad);
});

test("zipError gates New Jersey by reason", () => {
  assert.equal(zipError("07030", "general"), null);
  assert.equal(zipError("07001", "general"), null);
  assert.equal(zipError("08989", "general"), null);
  assert.match(zipError("07000", "general"), /New Jersey/);
  assert.match(zipError("08990", "general"), /New Jersey/);
  assert.match(zipError("90210", "probono"), /New Jersey/);
  assert.equal(zipError("90210", "partner"), null);
  assert.match(zipError("0703", "partner"), /5-digit/);
  assert.match(zipError("abcde", "partner"), /5-digit/);
  assert.match(zipError("", "general"), /enter your ZIP/i);
});

test("todayInNewJersey returns an ET calendar date, not a UTC one", () => {
  const d = todayInNewJersey();
  assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  const et = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  assert.equal(d, et);
});

test("isValidDateString rejects impossible calendar dates", () => {
  assert.equal(isValidDateString("2026-11-01"), true);
  for (const bad of ["2026-02-30", "2026-13-01", "11-01-2026", "2026-1-1", ""])
    assert.equal(isValidDateString(bad), false, bad);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module` or missing-export errors for each named function.

- [ ] **Step 3: Implement `app/lib/validation.mjs`**

Write the signatures from the Interfaces block. Two points the tests and signatures do not determine:

The email pattern, exactly:

```js
const LOCAL = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?";
const EMAIL = new RegExp(
  `^${LOCAL}(?:\\.${LOCAL})*@${LABEL}(?:\\.${LABEL})*\\.[A-Za-z]{2,63}$`
);
```

`isValidEmail` also enforces `length <= FIELD_CAPS.email`.

Phone: strip non-digits; if the result is 11 digits beginning `1`, drop that digit; then require `/^[2-9]\d{2}[2-9]\d{6}$/` (NANP — neither area nor exchange code may begin 0 or 1). An 11-digit value not beginning `1` fails, because stripping leaves 11 digits.

`todayInNewJersey` uses `toLocaleDateString("en-CA", { timeZone: "America/New_York" })`, which yields `YYYY-MM-DD`.

- [ ] **Step 4: Run them to verify they pass**

Run: `npm test`
Expected: PASS, all validation tests.

- [ ] **Step 5: Commit**

```bash
git add app/lib/validation.mjs app/lib/validation.test.mjs
git commit -m "feat: add shared validation module with hardened phone and email rules"
```

---

### Task 3: `app/lib/leadEmail.mjs` — the email template

**Files:**
- Create: `app/lib/leadEmail.mjs`
- Test: `app/lib/leadEmail.test.mjs`

**Interfaces:**
- Consumes: `REASONS` from `app/lib/validation.mjs`.
- Produces: `renderLeadEmail(payload: object) -> { subject: string, html: string }`, pure.

- [ ] **Step 1: Write the failing tests**

Create `app/lib/leadEmail.test.mjs`:

```js
test("subject carries reason, name and ZIP", () => {
  assert.equal(
    renderLeadEmail({ reason: "general", name: "Jane Doe", zip: "07030" }).subject,
    "Care request — Jane Doe (07030)");
  assert.equal(
    renderLeadEmail({ reason: "probono", name: "Jane Doe", zip: "07030" }).subject,
    "Pro bono request — Jane Doe (07030)");
  assert.equal(
    renderLeadEmail({ reason: "partner", name: "Jane", town: "Acme Health" }).subject,
    "Partnership — Acme Health");
});

test("a partner payload emits no care rows", () => {
  const { html } = renderLeadEmail({
    reason: "partner", name: "Jane", email: "a@b.co", phone: "2015550123",
    zip: "07030", town: "Acme Health", story: "Hello",
  });
  for (const absent of ["Care needs", "Care type", "Start date", "Hours",
                        "Who needs care", "Caregiver preferences"])
    assert.ok(!html.includes(absent), absent);
  assert.ok(html.includes("Acme Health"));
});

test("absent and empty fields emit no row", () => {
  const { html } = renderLeadEmail({
    reason: "general", name: "Jane", email: "a@b.co", phone: "2015550123",
    zip: "07030", recipientNotes: "", caregiverPreferences: null,
  });
  assert.ok(!html.includes("What to know"));
  assert.ok(!html.includes("Caregiver preferences"));
});

test("free text is HTML-escaped", () => {
  const { html } = renderLeadEmail({
    reason: "general", name: '<script>alert(1)</script>', email: "a@b.co",
    phone: "2015550123", zip: "07030",
    recipientNotes: 'Tom & "Jerry" <b>bold</b>',
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
  assert.ok(html.includes("&quot;") || html.includes("&#34;"));
  assert.ok(!html.includes("<b>bold</b>"));
});

test("an unbroken long word cannot widen the table", () => {
  const { html } = renderLeadEmail({
    reason: "general", name: "Jane", email: "a@b.co", phone: "2015550123",
    zip: "07030", recipientNotes: "A".repeat(400),
  });
  assert.match(html, /word-break:\s*break-word/);
});

test("care rows render in the documented order", () => {
  const { html } = renderLeadEmail({
    reason: "general", name: "Jane", email: "a@b.co", phone: "2015550123",
    zip: "07030", careNeeds: ["personal_care", "companionship"],
    careType: "recurring", startDate: "2026-11-01", endDate: "2026-12-01",
    timeStart: 9, timeEnd: 17, careRecipient: "parent",
    recipientGender: "female", recipientAgeRange: "80s",
  });
  const order = ["Reason", "Name", "Email", "Phone", "ZIP", "Care needs",
                 "Care type", "Start date", "End date", "Hours",
                 "Who needs care", "Gender", "Age"];
  const idx = order.map(l => html.indexOf(l));
  assert.deepEqual(idx, [...idx].sort((a, b) => a - b));
  assert.ok(idx.every(i => i > -1));
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './leadEmail.mjs'`.

- [ ] **Step 3: Implement `renderLeadEmail`**

Build a `<table>` of label/value rows, skipping any field that is `null`, `undefined`, or an empty string after trimming. Escape every interpolated value through a local `esc()` covering `& < > " '`. Put `word-break: break-word` in the value cell's inline style — email clients strip `<style>` blocks, so all styling is inline. Render enum values as their human labels (the `careNeeds` / `careType` / recipient label text already in `Contact.jsx`), and `timeStart`/`timeEnd` as a single "Hours" row using the same 12-hour format as the form, with 24 shown as "midnight".

- [ ] **Step 4: Run them to verify they pass**

Run: `npm test`
Expected: PASS, all leadEmail and validation tests.

- [ ] **Step 5: Commit**

```bash
git add app/lib/leadEmail.mjs app/lib/leadEmail.test.mjs
git commit -m "feat: add lead email template with escaping and per-flow rows"
```

---

### Task 4: Rewrite the server action onto Resend

**Files:**
- Modify: `app/actions/contact.js` (full rewrite)
- Modify: `app/lib/site.js`
- Modify: `package.json`
- Delete: `lib/supabase/client.js`, `lib/supabase/server.js`, `.env.production`
- Modify: `.gitignore`
- Test: `app/lib/rateLimit.test.mjs`
- Create: `app/lib/rateLimit.mjs`

**Interfaces:**
- Consumes: all validators from Task 2; `renderLeadEmail` from Task 3.
- Produces: `submitContactForm(payload) -> {success: true, reason} | {success: false, error: "validation" | "server"}` — signature unchanged from today, so `Contact.jsx` needs no import change. Also from `app/lib/rateLimit.mjs`: `checkRateLimit(ip: string, now?: number) -> boolean`, `resetRateLimit() -> void`, and mutable `RATE_LIMIT = { max: 5, windowMs: 600000 }`.

- [ ] **Step 1: Write the failing rate-limit test**

Create `app/lib/rateLimit.test.mjs`:

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './rateLimit.mjs'`.

- [ ] **Step 3: Implement `app/lib/rateLimit.mjs`**

`checkRateLimit(ip, now = Date.now())` over a module-scope `Map<string, number[]>`: drop timestamps older than `RATE_LIMIT.windowMs`, return `false` if the survivors already number `RATE_LIMIT.max`, otherwise push `now` and return `true`. Export `resetRateLimit()` for tests and `RATE_LIMIT` as a mutable object.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Install Resend and add the constants**

```bash
npm install resend
```

Add to `app/lib/site.js`:

```js
export const LEAD_TO_EMAIL = "neil@careberi.com";
export const LEAD_FROM_EMAIL = "careberi forms <forms@send.careberi.com>";
export const GOOGLE_REVIEW_URL = "https://g.page/r/CS99ad_3D3tKECE/review";
```

- [ ] **Step 6: Rewrite `app/actions/contact.js`**

Keep `"use server"` and the exported signature. Order of operations, which the Interfaces block does not fix:

1. If `payload.company_website` is non-empty → `return { success: true, reason: payload.reason }`. Send nothing. The success response is deliberate: an error teaches a bot to retry.
2. Read `x-forwarded-for` via `headers()` from `next/headers`, take the first comma-separated entry, and call `checkRateLimit`. On `false` → `{ success: false, error: "server" }`.
3. Validate using Task 2's functions. Enforce every cap in `FIELD_CAPS`; allow-list `reason`, `careType`, `careRecipient`, `recipientGender`, `careNeeds`, and `recipientAgeRange` (the last of these was previously free text). Dates: shape-valid, `startDate >= todayInNewJersey()`, `endDate >= startDate` when present. Times: integers 0–24 with `timeStart < timeEnd`. Any failure → `{ success: false, error: "validation" }`.
4. `renderLeadEmail`, then `new Resend(process.env.RESEND_API_KEY).emails.send({ from: LEAD_FROM_EMAIL, to: LEAD_TO_EMAIL, replyTo: email, subject, html })`.
5. Resend error or thrown → `console.error` and `{ success: false, error: "server" }`.

Delete the two Supabase imports and every reference to them.

- [ ] **Step 7: Remove Supabase and the tracked env file**

```bash
git rm -r lib/supabase
git rm .env.production
npm uninstall @supabase/ssr @supabase/supabase-js
```

Remove the `!.env.production` line from `.gitignore`.

- [ ] **Step 8: Verify nothing references Supabase and the build passes**

Run: `grep -rn "supabase" app lib package.json --include=* -i` then `npm run build`
Expected: grep prints nothing; build completes with no module-resolution errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: send contact submissions by email via Resend, drop Supabase"
```

---

### Task 5: Accessible care-need checkboxes

**Files:**
- Modify: `app/components/Contact.jsx` (`renderCareNeeds`, `renderCareType`, `renderRecipient`)
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `CARE_NEEDS` from Task 2.
- Produces: nothing other tasks consume.

This is the WCAG 2.1.1 Level A block: the cards are `<div role="checkbox" tabIndex={0}>` with only an `onClick`, so Space and Enter do nothing and step 2 cannot be completed without a pointer. axe-core reports zero violations here, so the fix is verified by behaviour, not by a scanner.

- [ ] **Step 1: Replace the custom checkboxes**

In `renderCareNeeds`, replace each `<div role="checkbox" aria-checked tabIndex={0} onClick>` with a `<label className="choice-card">` containing a real `<input type="checkbox" checked onChange>`. Remove `role`, `aria-checked`, and `tabIndex` entirely — the native control supplies all three. Wrap the `.choice-cards` container in `<fieldset>` with a `<legend>` reading `What kind of help are you looking for?`, and drop the now-duplicated `<h3>`.

- [ ] **Step 2: Add `aria-pressed` to the pill and toggle buttons**

In `renderCareType` and `renderRecipient`, add `aria-pressed={formData.careType === opt.value}` to each `.pill-btn` and the equivalent on both `.toggle-btn` gender buttons. They are real `<button>`s, so keyboard already works; only the state was unexposed.

- [ ] **Step 3: Style the native input without losing the card look**

In `app/globals.css`, visually hide the checkbox (clip-path or 1px absolute, **not** `display:none`, which removes it from the accessibility tree) and move the existing `.choice-card.selected` and `.box` styling onto `:has(:checked)`. Add a `:focus-visible` ring on `.choice-card:has(:focus-visible)`, since the focus ring now belongs to a hidden input. Reset `fieldset` border/margin/padding so the wrapper is visually inert.

- [ ] **Step 4: Verify keyboard operation against the dev server**

Run `npm run dev`, then a Playwright script that focuses the first care-need control, presses Space, and reads `:checked`.
Expected: `checked` flips `false → true` on Space and back on a second Space; Tab moves between the six controls; a visible focus ring appears.

- [ ] **Step 5: Verify no axe regression**

Run the audit's axe pass against `#care-form` on the dev server.
Expected: 0 violations, and no new `aria-*` findings.

- [ ] **Step 6: Commit**

```bash
git add app/components/Contact.jsx app/globals.css
git commit -m "fix: make care-need selection keyboard operable with native checkboxes"
```

---

### Task 6: Remaining form correctness

**Files:**
- Modify: `app/components/Contact.jsx`
- Modify: `app/globals.css` (the honeypot's off-screen rule)
- Create: `app/lib/formState.mjs`
- Test: `app/lib/formState.test.mjs`

**Interfaces:**
- Consumes: Task 2's validators.
- Produces: `resetBranchFields(formData: object, nextReason: string) -> object` from `app/lib/formState.mjs`.

- [ ] **Step 1: Write the failing branch-reset test**

In a new `app/lib/formState.test.mjs`:

```js
test("switching care -> partner clears care answers", () => {
  const next = resetBranchFields({
    name: "Jane", reason: "general", careNeeds: ["personal_care"],
    careType: "recurring", startDate: "2026-11-01", careRecipient: "parent",
    recipientNotes: "notes", town: "",
  }, "partner");
  assert.equal(next.name, "Jane", "shared fields survive");
  assert.deepEqual(next.careNeeds, []);
  assert.equal(next.careType, "");
  assert.equal(next.startDate, "");
  assert.equal(next.careRecipient, "");
  assert.equal(next.recipientNotes, "");
});

test("switching partner -> care clears partner answers", () => {
  const next = resetBranchFields(
    { reason: "partner", town: "Acme", story: "hi" }, "general");
  assert.equal(next.town, "");
  assert.equal(next.story, "");
});

test("care -> partner -> care leaves no partner residue", () => {
  const a = resetBranchFields({ reason: "general", careNeeds: ["x"] }, "partner");
  const b = resetBranchFields({ ...a, reason: "partner", town: "Acme" }, "general");
  assert.equal(b.town, "");
  assert.deepEqual(b.careNeeds, []);
});

test("general -> probono keeps care answers (same branch)", () => {
  const next = resetBranchFields(
    { reason: "general", careNeeds: ["personal_care"] }, "probono");
  assert.deepEqual(next.careNeeds, ["personal_care"]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './formState.mjs'`.

- [ ] **Step 3: Implement `resetBranchFields`**

Returns a new object. If `nextReason` and `formData.reason` are on the same side of the partner/care boundary, return the data unchanged. Otherwise reset only the fields belonging to the branch being left, back to their `initialFormData` values.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Wire the remaining fixes into `Contact.jsx`**

Each is independent:

- Delete the local `isValidEmail` / `isValidZip` / `isNjZip` / `zipRequiresNj` / `zipError` definitions and import them from `app/lib/validation.mjs`.
- `finalizeAndSubmit`: add `const submittingRef = useRef(false)` and return early when it is already `true`; clear it in a `finally`. Refs commit synchronously, closing the sub-70ms window `disabled={submitting}` cannot.
- ZIP input: remove `maxLength={5}`; in `onChange` set `e.target.value.replace(/\D/g, "").slice(0, 5)`. Add `autoComplete="postal-code"`.
- Reason `onChange`: route through `resetBranchFields`.
- `handleScheduleNext`: reject a `startDate` before `todayInNewJersey()` and an `endDate` before `startDate`, with field errors. Add `min={todayInNewJersey()}` to `#startDate` and `min={formData.startDate || todayInNewJersey()}` to `#endDate`.
- Phone error copy → `Enter a 10-digit US phone number, with or without a leading 1.`
- `formatHour`: return `"midnight"` for 24.
- Step counter: render the `.wizard-progress` block and the `aria-label` only when `formData.reason` is non-empty, so the total stops jumping from 6 to 2.
- Add the honeypot to `renderIntro`: `<input name="company_website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={formData.company_website} onChange={...} />`, add `company_website: ""` to `initialFormData`, and pass it in the `finalizeAndSubmit` payload. Add `.hp-field` to `globals.css` positioned off-screen — not `display:none`.

- [ ] **Step 6: Verify against the dev server**

Run a Playwright script covering: `+1 201 555 0123` accepted; `" 07030"` pasted → `07030`; a past start date rejected; an end date before start rejected; full-day slider reading `12:00 AM–midnight`; the step label absent until a reason is chosen; three parallel `click({noWaitAfter:true})` on Submit producing exactly one POST.
Expected: every assertion passes; exactly 1 POST.

- [ ] **Step 7: Commit**

```bash
git add app/components/Contact.jsx app/globals.css app/lib/formState.mjs app/lib/formState.test.mjs
git commit -m "fix: phone, ZIP, date, slider, step counter, branch reset and submit guard"
```

---

### Task 7: Layout and tap targets

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Capture the failing measurement**

Run a Playwright check at 320×568 asserting `scrollWidth === clientWidth`, and one at 390×844 listing interactive elements under 44px tall.
Expected: FAIL — `scrollWidth` 326 vs 320; the under-44px list includes the utility-bar phone link at 90×15, "Back to top" at 95×22, nav links at 39, "Family Portal" at 28.

- [ ] **Step 2: Add a sub-360px breakpoint**

The stylesheet's smallest existing breakpoint is 620px, which is the root cause. Add `@media (max-width: 360px)` reducing the `.wrap` gutter and `.pb-card` padding, and allowing `.pb-points li` to wrap. Identify the actual 6px contributor from the Step 1 output rather than guessing.

- [ ] **Step 3: Raise the tap targets**

Give the utility-bar phone link, "Family Portal", the nav links and "Back to top" `min-height: 44px` with matching padding and `align-items: center`. Keep every `font-size` as it is — enlarging the type would break the utility bar's proportions. This visibly increases the utility bar's height.

- [ ] **Step 4: Re-run the measurements**

Run the same two checks.
Expected: `scrollWidth === clientWidth` at 320×568; no interactive element under 44px tall at 390×844.

- [ ] **Step 5: Confirm nothing regressed at the other widths**

Run the audit's responsive sweep at 320, 360, 390, 768, 1024, 1440 and 1920.
Expected: no horizontal overflow at any width.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "fix: remove 320px overflow and raise tap targets to 44px"
```

---

### Task 8: Metadata, headers, 404 and the footer link

**Files:**
- Modify: `app/layout.jsx`, `next.config.mjs`, `app/components/Footer.jsx`
- Create: `app/not-found.jsx`

**Interfaces:**
- Consumes: `GOOGLE_REVIEW_URL` from Task 4.
- Produces: nothing.

- [ ] **Step 1: Replace LocalBusiness with Organization**

In `app/layout.jsx`, change the JSON-LD `@type` from `LocalBusiness` to `Organization`, drop the `address` and `openingHoursSpecification` blocks, and set `priceRange` to `"$$"`. Keep `@id`, `name`, `description`, `url`, `logo`, `image`, `telephone`, `email`, `areaServed`, `knowsAbout` and `hasOfferCatalog` exactly as they are. Leave the `FAQPage` script untouched — it was already correct.

- [ ] **Step 2: Move the utility bar inside the header landmark**

`app/page.jsx:18-19` renders `<UtilityBar />` and `<Header />` as siblings, leaving `.utility` outside any landmark. `Header` owns the `<header>` element, so move the `<UtilityBar />` call into `Header.jsx` as the first child of `<header>`, above `<div className="bar">`, and delete it and its import from `page.jsx`. This resolves the one axe violation on the site ("All page content should be contained by landmarks").

- [ ] **Step 3: Gate the footer review button**

In `Footer.jsx`, import `GOOGLE_REVIEW_URL` and render the "Leave a review on Google" anchor only when it is truthy, with `target="_blank" rel="noopener noreferrer"`. The guard stays even though the value is now set, so a future blanking of the constant cannot reintroduce an `href="#"`. Verify the rendered markup contains the `g.page` URL and no `href="#"`.

- [ ] **Step 4: Add the 404 page**

Create `app/not-found.jsx`: the `BerryMark`, a one-line message, `201-266-5450` as a `tel:` link, and a link home. Reuse existing class names; no new CSS.

- [ ] **Step 5: Add the response headers**

Add a `headers()` block to `next.config.mjs` alongside the existing `redirects()`, applying to `/:path*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Strict-Transport-Security: max-age=63072000; includeSubDomains` — **no `preload`**, per Global Constraints. Also set `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` for `/`, replacing the one-year `s-maxage`.

- [ ] **Step 6: Verify locally**

Run `npm run build && npm start`, then `curl -sI http://localhost:3000/` and `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/nope`.
Expected: every header above present with these values; `404` for the unknown path, served by the new page. Confirm the JSON-LD parses and `@type` is `Organization`; confirm no `href="#"` remains in the footer markup.

- [ ] **Step 7: Commit**

```bash
git add app/layout.jsx app/not-found.jsx app/components/Footer.jsx next.config.mjs
git commit -m "fix: Organization schema, security headers, branded 404, gated review link"
```

---

### Task 9: End-to-end verification

**Files:** none modified. This task proves the spec's success criteria.

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

Criteria 1 and 2 need `RESEND_API_KEY` and a verified `send.careberi.com`. If they are not yet available, run steps 2–4 and record criteria 1–2 as blocked on the carve-out rather than reporting them passed.

- [ ] **Step 1: Confirm the full unit suite is green**

Run: `npm test`
Expected: PASS, every test from Tasks 1–6.

- [ ] **Step 2: Submit each flow against the dev server**

With the key set, submit general, probono and partner.
Expected: three emails at `neil@careberi.com` with the documented subjects; every submitted field present; `Reply` addresses the submitter; the partner email contains no care rows.

- [ ] **Step 3: Verify the honeypot and the rate limit**

Submit once with `company_website` filled; then submit 6 times inside 10 minutes.
Expected: the honeypot submission returns success and produces **no** email; the 6th submission is refused.

- [ ] **Step 4: Re-run the full audit sweep**

Re-run the recon, wizard and deep scripts in `scratchpad/pw/` against the dev server.
Expected: no console or page errors; keyboard completes the form; 320px has no overflow; no element under 44px; axe reports 0 violations.

- [ ] **Step 5: Commit any fixes and record the outcome**

Commit anything Step 4 surfaced, then note in the ledger which criteria passed and which are blocked on the carve-outs.

---

## Carve-outs — not implemented by this plan

Verification of criteria 1–2 depends on the first of these.

1. **Resend:** sign up, verify `send.careberi.com`, add the DKIM records, set `RESEND_API_KEY` in Hostinger's environment panel.
2. **Supabase:** restore the project, export `contact_submissions` to CSV, then delete it — before this branch merges, while the export still matters.
3. **Hostinger TLS ticket:** ~30% of cold HTTPS loads fail with `tlsv1 alert internal error`. Server-side; no code fix. Ask them to check the IPv6 vhost too.
4. ~~**Google review URL**~~ — supplied: `https://g.page/r/CS99ad_3D3tKECE/review`. Verified live (HTTP 200, Maps reviews-dialog deep link); the place ID was not independently confirmed as careberi's listing, so Neil should click it once.
