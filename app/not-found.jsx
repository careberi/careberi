import Link from "next/link";
import BerryMark from "./components/BerryMark";

export const metadata = {
  title: "Page not found | careberi",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="top" className="notfound">
      <div className="wrap">
        <BerryMark className="mark" title="careberi" />
        <h1>We couldn&apos;t find that page.</h1>
        <p className="lede">
          The link may be out of date. If you need care today, call us — a person
          answers 24/7, every day of the year.
        </p>
        <div className="nf-actions">
          <a className="btn btn-primary" href="tel:+12012665450">
            Call 201-266-5450
          </a>
          <Link className="btn btn-ghost" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
