export default function UtilityBar() {
  return (
    <div className="utility">
      <div className="wrap">
        <div className="u-left">
          <span className="u-long">To get care today, call</span>
          <span className="u-short">Call</span> or text{" "}
          <a href="tel:+12012665450">201-266-5450</a>
        </div>
        <div className="u-right">
          <a
            className="portal"
            href="https://carebericp.caresmartz360.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Family Portal
          </a>
          <a className="u-wide" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
