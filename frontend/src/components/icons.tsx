import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function icon(size: number, props: IconProps) {
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none", ...props };
}

export function Heart({ size = 24, filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...icon(size, props)}>
      {filled ? (
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="currentColor"
          stroke="none"
        />
      ) : (
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function Comment({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)}>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Share({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)}>
      <path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="16 6 12 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Bookmark({ size = 24, filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...icon(size, props)}>
      {filled ? (
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          fill="currentColor"
          stroke="none"
        />
      ) : (
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function Dots({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export function AIIllustration({ size = 468, ...props }: IconProps) {
  const w = size;
  const h = Math.round(size * 0.75);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width={w} height={h} rx="8" fill="#0d1117" />
      {[
        [60, 60],
        [180, 40],
        [300, 50],
        [420, 60],
        [100, 160],
        [240, 140],
        [380, 160],
        [60, 260],
        [180, 270],
        [300, 260],
        [420, 270],
        [160, 320],
        [340, 310],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill="#58a6ff" opacity="0.9" />
      ))}
      {[
        [0, 1],
        [1, 2],
        [2, 3],
        [0, 4],
        [1, 5],
        [2, 6],
        [4, 7],
        [5, 8],
        [6, 9],
        [7, 8],
        [8, 9],
        [4, 11],
        [5, 12],
        [9, 12],
        [8, 11],
        [10, 9],
        [7, 3],
      ].map(([a, b], i) => {
        const coords = [
          [60, 60],
          [180, 40],
          [300, 50],
          [420, 60],
          [100, 160],
          [240, 140],
          [380, 160],
          [60, 260],
          [180, 270],
          [300, 260],
          [420, 270],
          [160, 320],
          [340, 310],
        ];
        return (
          <line
            key={i}
            x1={coords[a][0]}
            y1={coords[a][1]}
            x2={coords[b][0]}
            y2={coords[b][1]}
            stroke="#30363d"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      })}
      <text
        x={w / 2}
        y={h / 2 + 80}
        textAnchor="middle"
        fill="#8b949e"
        fontSize="13"
        fontFamily="monospace"
      >
        Neural Network Architecture
      </text>
    </svg>
  );
}
