export function getTipoAmbienteBadgeClasses(tipoNome: string) {
  if (tipoNome === "Sala comum") {
    return "bg-[#e7edf8] text-[#3a4a99] hover:bg-[#e7edf8]/80 border-transparent";
  }

  const hash = tipoNome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const palettes = [
    "bg-[#f7e7e2] text-[#a8442f] hover:bg-[#f7e7e2]/80 border-transparent",
    "bg-[#e6f2ea] text-[#2f7d4f] hover:bg-[#e6f2ea]/80 border-transparent",
    "bg-[#f6eede] text-[#b26a12] hover:bg-[#f6eede]/80 border-transparent",
    "bg-[#efedf7] text-[#5b53a6] hover:bg-[#efedf7]/80 border-transparent",
    "bg-[#e0f2fe] text-[#0e7490] hover:bg-[#e0f2fe]/80 border-transparent",
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export function getTipoAmbienteBadgeColors(tipoNome: string) {
  if (tipoNome === "Sala comum") {
    return { label: tipoNome, fg: "#3a4a99", bg: "#e7edf8" };
  }

  const hash = tipoNome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const palettes = [
    { fg: "#a8442f", bg: "#f7e7e2" }, // Orange/Red
    { fg: "#2f7d4f", bg: "#e6f2ea" }, // Green
    { fg: "#b26a12", bg: "#f6eede" }, // Yellow/Orange
    { fg: "#5b53a6", bg: "#efedf7" }, // Purple
    { fg: "#0e7490", bg: "#e0f2fe" }, // Cyan
  ];

  const index = Math.abs(hash) % palettes.length;
  return { label: tipoNome, ...palettes[index] };
}
