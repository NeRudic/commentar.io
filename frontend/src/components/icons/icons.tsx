import type { SVGProps } from "react";
import styles from "./icons.module.css";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function icon(size: number, props: IconProps) {
  return { width: size, height: size, viewBox: "0 0 24 24", ...props };
}

export function Heart({ size = 24, filled, ...props }: IconProps & { filled?: boolean }) {
  const d =
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";
  return (
    <svg {...icon(size, props)} className={styles.illustration}>
      <path d={d} className={filled ? styles.fill : styles.stroke} />
    </svg>
  );
}

export function Comment({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.illustration}>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        className={styles.stroke}
      />
    </svg>
  );
}

export function Share({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.illustration}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" className={styles.stroke} />
      <polyline points="16 6 12 2 8 6" className={styles.stroke} />
      <line x1="12" y1="2" x2="12" y2="15" className={styles.stroke} />
    </svg>
  );
}

export function Bookmark({ size = 24, filled, ...props }: IconProps & { filled?: boolean }) {
  const d = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z";
  return (
    <svg {...icon(size, props)} className={styles.illustration}>
      <path d={d} className={filled ? styles.fill : styles.stroke} />
    </svg>
  );
}

export function ChevronLeft({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.stroke}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRight({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.stroke}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function Close({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.illustration}>
      <line x1="18" y1="6" x2="6" y2="18" className={styles.stroke} />
      <line x1="6" y1="6" x2="18" y2="18" className={styles.stroke} />
    </svg>
  );
}

export function Dots({ size = 24, ...props }: IconProps) {
  return (
    <svg {...icon(size, props)} className={styles.fill}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

// --- Illustrations ---

type IllustrationProps = IconProps & { label?: string; accentColor?: string };

export function AIIllustration({
  size = 468,
  label = "Neural Network Architecture",
  accentColor = "#58a6ff",
  ...props
}: IllustrationProps) {
  const w = size;
  const h = Math.round(size * 0.75);
  const nodes = [
    [60, 60], [180, 40], [300, 50], [420, 60],
    [100, 160], [240, 140], [380, 160],
    [60, 260], [180, 270], [300, 260], [420, 270],
    [160, 320], [340, 310],
  ];
  const edges = [
    [0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[4,7],[5,8],[6,9],
    [7,8],[8,9],[4,11],[5,12],[9,12],[8,11],[10,9],[7,3],
  ];
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.illustration}
      {...props}
    >
      <rect width={w} height={h} rx="8" className={styles.bg} />
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill={accentColor} opacity="0.9" />
      ))}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#30363d" strokeWidth="1" opacity="0.5"
        />
      ))}
      <text x={w / 2} y={h - 20} className={styles.label}>{label}</text>
    </svg>
  );
}

export function DiffusionIllustration({
  size = 468,
  label = "Diffusion Process",
  accentColor = "#7c3aed",
  ...props
}: IllustrationProps) {
  const w = size;
  const h = Math.round(size * 0.75);
  const cx = w / 2;
  const cy = h / 2 - 20;
  const steps = 5;
  const maxR = 90;
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.illustration}
      {...props}
    >
      <rect width={w} height={h} rx="8" className={styles.bg} />
      {Array.from({ length: steps }, (_, i) => {
        const r = maxR - i * 18;
        const opacity = 0.15 + i * 0.2;
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r}
            stroke={accentColor} strokeWidth="1.5"
            fill={accentColor} fillOpacity={opacity} opacity={0.8}
          />
        );
      })}
      <text x={cx - maxR - 10} y={cy + 6} fill="#8b949e" fontSize="11" fontFamily="monospace" textAnchor="end">
        noise
      </text>
      <text x={cx + maxR + 10} y={cy + 6} fill="#8b949e" fontSize="11" fontFamily="monospace" textAnchor="start">
        image
      </text>
      <text x={cx} y={h - 20} className={styles.label}>{label}</text>
    </svg>
  );
}

export function RLIllustration({
  size = 468,
  label = "Reinforcement Learning",
  accentColor = "#f59e0b",
  ...props
}: IllustrationProps) {
  const w = size;
  const h = Math.round(size * 0.75);
  const ax = 80;
  const ay = h / 2 - 10;
  const ex = w - 80;
  const ey = h / 2 - 10;
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.illustration}
      {...props}
    >
      <rect width={w} height={h} rx="8" className={styles.bg} />
      <rect x={ax - 45} y={ay - 30} width="90" height="60" rx="12" stroke={accentColor} strokeWidth="2" fill={accentColor} fillOpacity="0.1" />
      <text x={ax} y={ay + 5} textAnchor="middle" fill={accentColor} fontSize="12" fontFamily="monospace" fontWeight="600">
        Agent
      </text>
      <rect x={ex - 55} y={ey - 30} width="110" height="60" rx="12" stroke="#10b981" strokeWidth="2" fill="#10b981" fillOpacity="0.1" />
      <text x={ex} y={ey + 5} textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="monospace" fontWeight="600">
        Environment
      </text>
      <line x1={ax + 45} y1={ay - 12} x2={ex - 55} y2={ey - 12} stroke={accentColor} strokeWidth="2" markerEnd="url(#arrowA)" />
      <text x={(ax + ex) / 2} y={ay - 22} textAnchor="middle" fill="#8b949e" fontSize="10" fontFamily="monospace">
        action
      </text>
      <line x1={ex - 55} y1={ey + 20} x2={ax + 45} y2={ay + 20} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowR)" />
      <text x={(ax + ex) / 2} y={ey + 36} textAnchor="middle" fill="#8b949e" fontSize="10" fontFamily="monospace">
        state, reward
      </text>
      <defs>
        <marker id="arrowA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10" fill={accentColor} />
        </marker>
        <marker id="arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10" fill="#10b981" />
        </marker>
      </defs>
      <text x={w / 2} y={h - 20} className={styles.label}>{label}</text>
    </svg>
  );
}
