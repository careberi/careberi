# Contact-form email delivery + site-wide bug sweep

**Date:** 2026-10-02
**Status:** awaiting approval
**Author:** Neil Perry (with Claude)

## Why this work exists

A full functional test of https://www.careberi.com on 2026-10-02 found the
contact form completely non-functional in production. Its only data path is an
insert into Supabase project `cboikctscjnbemwforrn`, which is paused —
`cboikctscjnbemwforrn.supabase.co` does not resolve in DNS. Verified end to end:
completing the wizard fires three POSTs (the retry loop), all returning HTTP 200
with a failure payload, and shows *"Something went wrong sending your request.
Please call us instead at 201-266-5450"* after ~2.2s.

Every care request, pro bono application, and partnership inquiry submitted since
the project paused has been lost. There is no fallback capture, no logging of the
payload, and no alerting.

The same test pass found 20 further defects, ranging from a hard accessibility
block that prevents keyboard users from completing the form at all, to layout and
metadata issues.

## Intended outcome

Form submissions arrive in Neil's inbox as a readable table, with no database in
the path. The contact form becomes correct and accessible. The remaining defects
found in testing are fixed.

**Who it is for:** families and partners submitting the form; Neil, who reads the
resulting email and acts on it.

**What success looks like:** a submission on the live site produces an email at
`neil@careberi.com` within seconds, containing every field the visitor filled in,
with Reply going to the family. A keyboard-only user can complete the form
unaided. No lead is lost to an infrastructure pause ever again.

## Success criteria

Each is independently verifiable.

1. Submitting each of the three wizard flows (general, probono, partner) produces
   one email at `neil@careberi.com` with the correct subject prefix and all
   collected fields present.
2. `Reply` on that email addresses the submitter, not the sending domain.
3. `@supabase/ssr` and `@supabase/supabase-js` are absent from `package.json`, and
   `lib/supabase/` no longer exists.
4. A keyboard-only user can select care needs with Space or Enter and reach
   submission without a pointer.
5. Three clicks dispatched inside one frame on Submit produce exactly one
   server-action POST and one email. Measured with three parallel
   `click({noWaitAfter:true})` calls, since sequential clicks are already blocked
   by the existing `disabled` state. (The retry loop may still fire up to three
   POSTs when a send *fails*; this criterion is about the success path.)
6. `+1 201 555 0123` and `1-201-555-0123` are accepted; `0000000000` is rejected.
7. Pasting `" 07030"` or `07030-1234` into the ZIP field yields a valid `07030`.
8. `document.documentElement.scrollWidth === clientWidth` at 320×568.
9. `node --test` passes, covering every validation rule and the email template.
10. A submission with the honeypot field filled sends no email and returns success.

## Non-goals

Explicitly out of scope, so their absence is not mistaken for an oversight:

- **Auto-reply to the submitter.** Considered and declined.
- **Copy to `care@careberi.com`.** Considered and declined.
- **Server-side logging or alerting on send failure.** Considered and declined.
  Consequence, stated once and accepted: if the Resend call fails, the visitor
  sees the phone-number fallback and the lead is lost, the same as today but from
  a different cause. Resend is materially more reliable than a paused free-tier
  database, so this is still a large net improvement.
- **Keeping Supabase as an archive.** Declined; the dependency goes.
- **Any fix for the TLS fault.** Not a code problem. See Carve-outs.
- **README staleness.** The README still describes a Vercel deploy, a
  `Reviews.jsx` that no longer exists, and `$32–$38` pricing. Noted, not touched.
- **`public/hero-family.png`.** Untracked and unused. Left alone.

## Architecture: email delivery

Approach chosen: **swap the server action's body.** `submitContactForm` keeps its
name, signature, and validation; only the persistence call changes. The client
wizard's import does not change. Server actions already enforce origin checks and
keep the API key server-side by construction. Rejected alternatives: a new
`app/api/contact/route.js` (rewrites the client submit path and hand-rolls the
CSRF protection server actions give free), and `@react-email/components` (a
dependency and a build step for one template a literal can produce).

```
Contact.jsx  (import unchanged)
  └─> submitContactForm(payload)          app/actions/contact.js   "use server"
        ├─ honeypot filled? -> {success:true}, send nothing
        ├─ rate limit check (per-IP)
        ├─ validate + allow-list          app/lib/validation.mjs   (shared, pure)
        ├─ renderLeadEmail(payload)       app/lib/leadEmail.mjs    (pure)
        └─ resend.emails.send(...)        RESEND_API_KEY from env
              └─ {success:true} | {success:false, error:"server"}
```

### Files

| Action | Path |
|---|---|
| New | `app/lib/validation.mjs` — pure validators, shared by client and server |
| New | `app/lib/leadEmail.mjs` — pure `payload → {subject, html}` |
| New | `app/lib/validation.test.mjs`, `app/lib/leadEmail.test.mjs` |
| New | `app/not-found.jsx` |
| Rewrite | `app/actions/contact.js` |
| Edit | `app/components/Contact.jsx`, `Footer.jsx`, `RangeSlider.jsx` |
| Edit | `app/layout.jsx`, `app/lib/site.js`, `app/globals.css`, `next.config.mjs`, `package.json`, `.gitignore` |
| Delete | `lib/supabase/client.js`, `lib/supabase/server.js`, `lib/supabase/`, `.env.production` |

### Why `.mjs` for the two pure modules

`package.json` has no `"type": "module"`, so plain Node treats `.js` as CommonJS
and cannot import the ESM these modules need to share with the app. Adding
`"type": "module"` would change module resolution for the whole project. Naming
the two modules `.mjs` lets `node --test` run them with zero configuration and
zero dependencies; Next resolves `.mjs` imports normally, and the repo already
uses `.mjs` for `next.config.mjs` and `scripts/*.mjs`.

### Email shape

- **From:** `careberi forms <forms@send.careberi.com>` — a **subdomain**,
  deliberately. Verifying `send.careberi.com` in Resend puts DKIM records there
  and leaves the apex `MX → smtp.google.com` and
  `v=spf1 include:_spf.google.com ~all` untouched, so Google Workspace mail for
  `careberi.com` is unaffected.
- **To:** `neil@careberi.com`
- **Reply-To:** the submitter's email address.
- **Subject:** `Care request — {name} ({zip})` · `Pro bono request — {name} ({zip})`
  · `Partnership — {town}`. Reason and identity first, so the inbox is triageable.
- **Body:** one HTML table. **Only rows for fields the flow actually collected** —
  a partner submission carries no care rows. Field order: reason, name, email,
  phone, ZIP, organization, care needs, care type, dates, hours, recipient
  (who / gender / age / notes), caregiver preferences, story.
- **Config:** `RESEND_API_KEY` in Hostinger's environment panel — never in a
  tracked file. Recipient and from-address are plain constants in
  `app/lib/site.js`; they are not secrets, and constants beat env vars someone has
  to remember to set.

## Validation (shared module)

Today each side carries its own `isValidEmail` / `isValidZip` / `isNjZip`. That
duplication is how the phone and ZIP defects survived. One module, imported by
both, is the fix.

| Rule | Specification |
|---|---|
| Phone | Strip non-digits. If 11 digits beginning `1`, drop the leading `1`. Require `^[2-9]\d{2}[2-9]\d{6}$` (NANP: area and exchange codes cannot begin 0 or 1). Accepts `+1 201 555 0123`; rejects `0000000000`, `1111111111`. |
| Email | Dot-separated local part (no leading, trailing, or consecutive dots), hostname labels that neither start nor end with a hyphen, and an alphabetic TLD of 2–63 characters. Max 254 chars. Pattern below. Rejects `a@b.c`, `a@example..com`, `a@-.com`, `a@[127.0.0.1]`, `test@example.com.`, `a@b.c<script>`. |
| ZIP | Unchanged: 5 digits; `07001`–`08989` required for `general` and `probono`, any 5 digits for `partner`. Verified correct against NJ's real range. |
| Length caps | Enforced server-side. name 120, email 254, town 200, story 5000, recipientNotes 5000, caregiverPreferences 5000. Over the cap is a `validation` error, never silent truncation. |
| `recipientAgeRange` | Allow-listed against the eight values the client offers. This is the one field the server previously accepted as free text. |
| Dates | `^\d{4}-\d{2}-\d{2}$` and a real calendar date. `startDate` ≥ today; `endDate` ≥ `startDate` when present. "Today" is computed in `America/New_York`, since the business operates in NJ. |
| Times | `timeStart` / `timeEnd` integers 0–24, `timeStart < timeEnd`. |
| Allow-lists | `reason`, `careType`, `careRecipient`, `recipientGender`, `careNeeds` keep their existing server-side allow-lists. These were already correct. |

The email pattern, kept out of the table so it reads exactly:

```js
const LOCAL = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?";
const EMAIL = new RegExp(
  `^${LOCAL}(?:\\.${LOCAL})*@${LABEL}(?:\\.${LABEL})*\\.[A-Za-z]{2,63}$`
);
```

### Honeypot

A field named `company_website` — bots fill anything resembling "website". Rendered
with `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`, moved off-screen
with CSS rather than `display:none` (which some bots detect and skip).

When it is non-empty the action returns `{success: true}` and sends nothing. The
success response is deliberate: a bot that receives an error learns to retry.

### Rate limit

A module-scope `Map` keyed on `x-forwarded-for`, sliding window, **5 submissions
per 10 minutes**, pruned on access. Roughly 15 lines.

Stated limitation: per-process and reset on restart, so it is a speed bump against
scripts, not a defense. Appropriate to the volume; a shared store would be
disproportionate here.

## Client form

| Defect | Fix |
|---|---|
| Three simultaneous clicks produced 6 POSTs (two full submissions) | A `useRef` guard at the top of `finalizeAndSubmit`. Refs update synchronously, so unlike `disabled={submitting}` they cannot be outrun by clicks landing inside the same frame. **Narrower than first reported:** `StepNav` already disables the button and shows "Sending…" within 77ms of the click, so an ordinary human double-click (150–300ms apart) is already blocked. Reproducing the duplicate needs clicks under ~70ms apart — a bouncing input, a scripted submit, or a bot. Still worth closing; the guard is three lines. |
| **Keyboard users cannot complete the form** | The care-need cards are `<div role="checkbox" tabIndex={0}>` with only an `onClick`; Space and Enter do nothing, and step 2 is mandatory. Replace with a visually-hidden real `<input type="checkbox">` inside `<label class="choice-card">`, wrapped in `<fieldset><legend>`. This *deletes* the custom ARIA rather than adding a key handler to it — native keyboard, focus ring, and screen-reader semantics come free. WCAG 2.1.1 (Level A). Note: axe-core reported zero violations here, which is why it went unnoticed. |
| Pills and toggles carry no state for assistive tech | `aria-pressed` on the care-type and gender buttons. They are real `<button>`s, so keyboard already works. |
| ZIP silently truncates pastes | Remove `maxLength={5}`; strip non-digits and slice to 5 in `onChange`, so `" 07030"` and `07030-1234` both resolve to `07030`. |
| ZIP lacks an autofill hint | `autoComplete="postal-code"` on the ZIP input. **Correction:** `autoComplete` is already present and correct on name, email and phone — ZIP is the only field missing it. |
| Past and inverted dates accepted | `min={today}` on start, `min={startDate}` on end, plus the shared check. |
| Full day renders "12:00 AM–12:00 AM" | `formatHour` special-cases 24 → "midnight", giving `12:00 AM–midnight`. Max stays 24 so "until midnight" remains expressible. |
| Step counter jumps "1 of 6" → "1 of 2" | Do not render the total until `reason` is chosen. |
| Care answers leak into partner submissions | Reset branch-specific fields when `reason` crosses the partner↔care boundary. The email template already renders only relevant rows; resetting state is the actual fix. |

## Site-wide

| Defect | Fix |
|---|---|
| 320px horizontal overflow (326 vs 320) | Root cause is structural: **the stylesheet has no breakpoint below 620px.** Add a ≤360px tier. Suspects are `.pb-card{padding:32px}` (which only relaxes at ≤860px) and `.pb-points li` (12px gap + 22px icon). Verified by asserting `scrollWidth === clientWidth` at 320×568. |
| Tap targets below minimum | Utility-bar phone link is 90×15 — the primary "call today" CTA. → 44px min-height. Nav links 39→44, "Back to top" 22→44, "Family Portal" 28→44. Achieved with padding, keeping type sizes; inflating the font would break the bar's proportions. **This is a visible density change to the utility bar.** |
| Footer "Leave a review on Google" is `href="#"` | Wire to `GOOGLE_REVIEW_URL` in `app/lib/site.js` with `target="_blank" rel="noopener noreferrer"`. While that constant is `null` the button does not render at all — no dead link ships. Neil supplies the value. |
| Bare Next.js 404 | `app/not-found.jsx`: mark, one line of copy, the phone number, link home, built from existing components. |
| No security headers | `headers()` in `next.config.mjs`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, restrictive `Permissions-Policy`, and HSTS **without `preload`**. Preload is effectively irreversible; committing to it while ~30% of TLS handshakes fail would be reckless. Add `preload` once Hostinger resolves the TLS fault. Headers must be verified with `curl` after deploy — LiteSpeed does not always honor Next's `headers()`. |
| `cache-control: s-maxage=31536000` | → `public, s-maxage=3600, stale-while-revalidate=86400`. A one-year shared-cache TTL is why copy edits can appear not to deploy. |
| axe: `.utility` outside any landmark | Move `<UtilityBar/>` inside `<header>`. The only violation axe found on the site. |
| LocalBusiness has no address, so earns no rich results | Replace with `Organization` + `Service` with `areaServed: New Jersey`. Honest for a pre-licensed agency with no public office, and it stops asserting a storefront. `FAQPage` markup and the service catalog are unchanged — both were already correct. |
| `priceRange: "$36–$50 per hour"` | → `"$$"`, the symbol form Google parses. |
| `.env.production` is git-tracked | Once Supabase is gone it holds nothing. Delete the file and remove the `!.env.production` negation from `.gitignore`, so no tracked env file exists for the Resend key to land in later. |

## Testing

No test framework exists and none is being added. `validation.mjs` and
`leadEmail.mjs` are pure functions, so Node's built-in runner covers them:
`*.test.mjs` files, `"test": "node --test"` in `package.json`, zero dependencies.

Every row in the Validation table becomes a test case, written before its fix.
`leadEmail` tests assert subject format per reason, that partner payloads emit no
care rows, that HTML special characters in free-text fields are escaped, and that
absent fields emit no row.

Browser-level criteria (4, 5, 7, 8) are verified with Playwright against the
running app, reusing the scripts in `scratchpad/pw/` from the audit.

## Risks

1. **Nothing is verifiable end-to-end until Resend exists.** The API key and a
   verified `send.careberi.com` are prerequisites for criteria 1–2. Unit tests and
   browser criteria can proceed without them.
2. **LiteSpeed may ignore `headers()`.** Verified post-deploy with `curl`; if
   ignored, the headers move to server config and that becomes a Hostinger task.
3. **DKIM on a subdomain is the safe path but adds a DNS step.** Getting it wrong
   sends mail to spam rather than failing loudly. Confirm with a real submission,
   not just a `200` from Resend.
4. **The tap-target changes are visible.** Neil should look at the utility bar
   before this ships.
5. **The rate limit will throttle our own browser testing.** Criteria 4, 5 and 7
   submit repeatedly from one IP and will trip the 5-per-10-minute window. The
   limit must be configurable at module scope so tests can raise it, rather than
   tests being written around it.

## Review focus

Classes of input the tests above do not exercise, to be checked deliberately:

- Unicode and RTL text in name and free-text fields, and how they render in the
  email table.
- HTML/script payloads in every free-text field — confirm escaping in the email
  body, since these now flow into rendered HTML rather than a database column.
- Extremely long single-word input (no spaces) and its effect on table layout.
- Simultaneous submissions from one IP interacting with the rate-limit window.
- A `reason` switched more than once (care → partner → care) and what state
  survives.
- Timezone boundary on the `startDate` ≥ today check around midnight ET.

## Carve-outs — Neil's checklist, outside this plan

1. **Hostinger TLS ticket.** ~30% of cold HTTPS loads fail with
   `tlsv1 alert internal error`; 4/10 raw handshakes and 14/20 cold browser loads
   succeeded, while google / cloudflare / example.com / hostinger.com were 10/10
   from the same machine at the same time. Certificate is valid (Let's Encrypt,
   expires 2026-12-24). Server-side fault; no code fix exists. Also ask them to
   verify the IPv6 vhost — an AAAA record exists that could not be reached from
   the test machine.
2. **Supabase.** Restore the project in the dashboard, export `contact_submissions`
   to CSV, then delete the project. Do this *before* merging, while the export
   still matters.
3. **Resend.** Sign up, verify `send.careberi.com`, add the DKIM records, set
   `RESEND_API_KEY` in Hostinger's environment panel.
4. **Google review URL.** Supply it, or the footer button stays unrendered.

## Implementation note

Current branch is `main`. Implementation must happen on a feature branch.
