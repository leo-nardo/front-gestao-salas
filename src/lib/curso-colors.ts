export function getCursoBorderColor(cursoNome: string) {
  const hash = cursoNome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const palette = [
    "#3a4a99",
    "#8a5a1a",
    "#0e6b62",
    "#a8442f",
    "#5b53a6",
    "#0e7490",
    "#2f7d4f",
    "#b26a12",
  ];

  return palette[Math.abs(hash) % palette.length];
}
