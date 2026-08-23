const PALETTE = [
  { text: "#3a4a99", bg: "#eceef8" },
  { text: "#8a5a1a", bg: "#f6eede" },
  { text: "#0e6b62", bg: "#e2f0ee" },
  { text: "#a8442f", bg: "#f7e7e2" },
  { text: "#5b53a6", bg: "#ecebf7" },
  { text: "#0e7490", bg: "#e0f2fe" },
  { text: "#2f7d4f", bg: "#e6f2ea" },
  { text: "#b26a12", bg: "#f6eede" },
];

function hashCursoNome(cursoNome: string) {
  const hash = cursoNome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return Math.abs(hash) % PALETTE.length;
}

/** Cor consistente por curso (mesmo curso = mesma cor sempre), gerada por
 * hash do nome — cobre qualquer curso, não só uma lista fixa. */
export function getCursoColors(cursoNome: string) {
  return PALETTE[hashCursoNome(cursoNome)];
}

export function getCursoBorderColor(cursoNome: string) {
  return PALETTE[hashCursoNome(cursoNome)].text;
}
