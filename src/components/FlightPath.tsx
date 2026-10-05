const STOPS = [
  { label: "You are here", x: 40, y: 190 },
  { label: "Germany", x: 190, y: 90 },
  { label: "Canada", x: 350, y: 150 },
  { label: "Singapore", x: 500, y: 70 },
  { label: "Your next step", x: 640, y: 130 },
];

export default function FlightPath() {
  const pathD = STOPS.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 680 240"
      className="w-full h-auto"
      role="img"
      aria-label="An illustrated route connecting a student's current location to Germany, Canada, Singapore, and their eventual destination"
    >
      <path
        d={pathD}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {STOPS.map((s, i) => (
        <g key={s.label}>
          <circle
            cx={s.x}
            cy={s.y}
            r={i === 0 || i === STOPS.length - 1 ? 7 : 5}
            fill={i === STOPS.length - 1 ? "var(--coral)" : i === 0 ? "var(--navy)" : "var(--surface)"}
            stroke="var(--navy)"
            strokeWidth={i === 0 || i === STOPS.length - 1 ? 0 : 1.5}
          />
          <text
            x={s.x}
            y={i % 2 === 0 ? s.y - 16 : s.y + 26}
            textAnchor="middle"
            className="font-mono"
            fontSize="12"
            fill="var(--ink-soft)"
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
