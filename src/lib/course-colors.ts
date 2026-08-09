export type CourseColor = { text: string; bg: string; border: string };

const PALETTE: CourseColor[] = [
  { text: "#3a4a99", bg: "#eceef8", border: "#3a4a99" }, // Direito
  { text: "#8a5a1a", bg: "#f6eede", border: "#8a5a1a" }, // Administração
  { text: "#0e6b62", bg: "#e2f0ee", border: "#0e6b62" }, // Enfermagem
  { text: "#a8442f", bg: "#f7e7e2", border: "#a8442f" }, // Biomedicina
  { text: "#5b53a6", bg: "#ecebf7", border: "#5b53a6" }, // Eng. de Software
  { text: "#0e7d8a", bg: "#e2f2f4", border: "#0e7d8a" },
  { text: "#a6537a", bg: "#f7e2ed", border: "#a6537a" },
  { text: "#6b7d0e", bg: "#eef2e2", border: "#6b7d0e" },
  { text: "#b26a12", bg: "#f6eede", border: "#b26a12" },
  { text: "#2f7d4f", bg: "#e6f2ea", border: "#2f7d4f" },
];

const DEFAULT_COLOR: CourseColor = {
  text: "#5b6470",
  bg: "#eef0f2",
  border: "#a2a8ac",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const cache = new Map<string, CourseColor>();

export function getCourseColor(
  cursoNome: string | undefined | null
): CourseColor {
  if (!cursoNome) return DEFAULT_COLOR;
  const cached = cache.get(cursoNome);
  if (cached) return cached;
  const color = PALETTE[hashString(cursoNome) % PALETTE.length];
  cache.set(cursoNome, color);
  return color;
}
