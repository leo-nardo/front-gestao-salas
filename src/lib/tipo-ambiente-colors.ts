// Cores por tipo de ambiente. Usam os tokens do tema (globals.css), então
// acompanham o modo escuro e as cores de destaque.

const BADGE_CLASSES = {
  info: "bg-info-bg text-info hover:bg-info-bg/80 border-transparent",
  destructive:
    "bg-destructive-bg text-destructive hover:bg-destructive-bg/80 border-transparent",
  success:
    "bg-success-bg text-success hover:bg-success-bg/80 border-transparent",
  warning:
    "bg-warning-bg text-warning hover:bg-warning-bg/80 border-transparent",
  purple:
    "bg-category-purple-bg text-category-purple hover:bg-category-purple-bg/80 border-transparent",
  cyan: "bg-category-cyan-bg text-category-cyan hover:bg-category-cyan-bg/80 border-transparent",
};

const PALETTE_ORDER = [
  "destructive",
  "success",
  "warning",
  "purple",
  "cyan",
] as const;

const BADGE_COLORS = {
  info: { fg: "var(--info)", bg: "var(--info-bg)" },
  destructive: { fg: "var(--destructive)", bg: "var(--destructive-bg)" },
  success: { fg: "var(--success)", bg: "var(--success-bg)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  purple: { fg: "var(--category-purple)", bg: "var(--category-purple-bg)" },
  cyan: { fg: "var(--category-cyan)", bg: "var(--category-cyan-bg)" },
};

function paletteKeyFor(tipoNome: string) {
  const hash = tipoNome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return PALETTE_ORDER[Math.abs(hash) % PALETTE_ORDER.length];
}

export function getTipoAmbienteBadgeClasses(tipoNome: string) {
  if (tipoNome === "Sala comum") return BADGE_CLASSES.info;
  return BADGE_CLASSES[paletteKeyFor(tipoNome)];
}

export function getTipoAmbienteBadgeColors(tipoNome: string) {
  if (tipoNome === "Sala comum") {
    return { label: tipoNome, ...BADGE_COLORS.info };
  }
  return { label: tipoNome, ...BADGE_COLORS[paletteKeyFor(tipoNome)] };
}
