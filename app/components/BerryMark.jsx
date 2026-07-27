export default function BerryMark({ className, style, title = "careberi" }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 240 300"
      role="img"
      aria-label={title}
    >
      <g stroke="#FFFFFF" strokeWidth="3">
        <path d="M138 104 Q96 98 68 42 Q118 62 138 104 Z" fill="#5AA9DE" strokeWidth="2.5" />
        <path d="M142 104 Q184 98 212 42 Q162 62 142 104 Z" fill="#93CDEC" strokeWidth="2.5" />
        <circle cx="117" cy="120" r="24" fill="#5AA9DE" />
        <circle cx="165" cy="120" r="24" fill="#2A5D9F" />
        <circle cx="93" cy="158" r="24" fill="#2F80C2" />
        <circle cx="141" cy="158" r="24" fill="#16265C" />
        <circle cx="189" cy="158" r="24" fill="#5AA9DE" />
        <circle cx="93" cy="196" r="24" fill="#2A5D9F" />
        <circle cx="141" cy="196" r="24" fill="#2F80C2" />
        <circle cx="189" cy="196" r="24" fill="#16265C" />
        <circle cx="117" cy="234" r="24" fill="#16265C" />
        <circle cx="165" cy="234" r="24" fill="#2F80C2" />
        <circle cx="141" cy="272" r="24" fill="#2A5D9F" />
      </g>
    </svg>
  );
}
