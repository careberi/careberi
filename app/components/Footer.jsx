import BerryMark from "./BerryMark";

export default function Footer() {
  return (
    <footer>
      <div className="foot">
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <BerryMark style={{ width: 26, height: "auto", flex: "none" }} title="careberi" />
            <strong
              style={{
                color: "var(--navy)",
                fontSize: "1.15rem",
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 600,
              }}
            >
              care<span style={{ color: "var(--marigold)" }}>beri</span>
            </strong>
          </span>
          Non-medical home care for seniors and adults with
          <br />
          disabilities across New Jersey
          <br />
          Licensed, bonded, and insured · NJ HCSA #0000000
        </div>
        <div>
          <a href="tel:+12017010942">(201) 701-0942</a>
          <br />
          <a href="mailto:care@careberi.com">care@careberi.com</a>
          <br />
          8am–8pm, seven days a week
        </div>
        <div>
          <a href="#approach">Our Approach</a> · <a href="#services">Our Services</a>
          <br />
          <a href="#probono">Pro Bono Care</a> · <a href="#jobs">Jobs</a> ·{" "}
          <a href="#partnerships">Partnerships</a>
          <br />
          <a href="#">Family Portal</a> · <a href="#">Privacy</a>
        </div>
        <div>
          <p style={{ marginBottom: 10 }}>Worked with us?</p>
          <a className="btn btn-ghost" href="#" rel="noopener">
            Leave a review on Google
          </a>
        </div>
      </div>
    </footer>
  );
}
