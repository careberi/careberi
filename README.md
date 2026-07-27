# careberi — website (Next.js)

Non-medical home care in New Jersey for seniors and people with disabilities.
This is the careberi marketing site, built with **Next.js** (React).

---

## The honest summary (please read first)

This is a real web app, not a single file you can double-click. To run or
publish it, a computer needs **Node.js** installed and has to run a couple of
commands. If that sounds like more than you want to deal with, the good news is
that the **easiest way to publish it is free and mostly point-and-click** — see
"Publish it (Vercel)" below. You do not need to understand the code.

---

## Run it on your own computer (to preview)

1. Install **Node.js** (the "LTS" version) from https://nodejs.org
2. Open Terminal (Mac) or Command Prompt (Windows), and go into this folder:
   ```
   cd path/to/careberi-next
   ```
3. Install the pieces it needs (one time):
   ```
   npm install
   ```
4. Start it:
   ```
   npm run dev
   ```
5. Open your browser to **http://localhost:3000**

Stop it anytime with `Ctrl + C` in the terminal.

---

## Publish it (Vercel — recommended, free)

Vercel is made by the same team as Next.js, so this "just works."

1. Put this project on **GitHub** (github.com — free account). If you're not
   comfortable with Git, any developer can do this in 10 minutes, or you can use
   GitHub Desktop (desktop.github.com) to drag the folder in.
2. Go to **vercel.com**, sign in with GitHub, click **Add New → Project**, and
   pick this repository.
3. Click **Deploy**. That's it — you get a live URL in about a minute.
4. To use **careberi.com**, open the project's **Settings → Domains** in Vercel
   and follow the steps to point your domain at it.

Every time the code changes on GitHub, Vercel re-publishes automatically.

---

## What still needs your real information

Search-and-replace these placeholders before you go live (a developer can do all
of it in under an hour):

- **Phone number** — `(555) 000-1234` / `+15550001234` appears in several files.
- **Email** — `care@careberi.com`
- **License number** — `NJ HCSA #0000000` in `app/components/Footer.jsx`
- **Service area** — currently "New Jersey" / "Bergen County" examples.
- **Pricing** — the `$32–$38` range in `app/components/Faq.jsx`.
- **Reviews** — the four reviews in `app/components/Reviews.jsx` are placeholders
  marked `[Replace with a real Google review.]`. Swap in real ones, or connect a
  live Google reviews widget (Elfsight / Trustindex / Featurable).
- **Family Portal link** — the `#` links point nowhere yet. Point them at your
  scheduling software's client login (WellSky, AxisCare, ClearCare, etc.).
- **Contact form** — right now it just shows a confirmation message; it does not
  send anywhere. Connect it to an email service (e.g. Formspree, or a Vercel
  serverless function) so submissions reach your inbox.
- **Domain in SEO tags** — `https://www.careberi.com` in `app/layout.jsx`.

---

## Where things live

```
app/
  layout.jsx            Fonts, SEO tags, Google structured data
  page.jsx              The page — lists the sections in order
  globals.css           All styling and brand colors (the :root block at top)
  components/
    UtilityBar.jsx      Navy top bar (phone + Family Portal)
    Header.jsx          Logo + navigation
    Hero.jsx            Headline + house illustration
    Approach.jsx        "Where are you right now?"
    Services.jsx        Services grid
    Reviews.jsx         Google-style reviews
    Steps.jsx           How it works
    ProBono.jsx         careberi Cares (pro bono program)
    Jobs.jsx            Caregiver careers
    Partnerships.jsx    Referral partners
    Faq.jsx             Frequently asked questions
    Contact.jsx         Contact form
    Footer.jsx          Footer
    BerryMark.jsx       The logo mark (reused in a few places)
```

Brand colors are CSS variables at the top of `globals.css` — change them once
there and they update everywhere.
