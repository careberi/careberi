export default function UtilityBar() {
  return (
    <div className="utility">
      <div className="wrap">
        <div className="u-left">
          To get care today, call or text{" "}
          <a href="tel:+15550001234">(555) 000-1234</a>
        </div>
        <div className="u-right">
          <a className="portal" href="#" rel="noopener">
            Family Portal
          </a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </div>
  );
}
