import { notFound } from "next/navigation";

// Endereços sem rota dentro de /[language] caem aqui e renderizam
// o `not-found.tsx` do segmento (o Next só o usa para notFound() explícito).
export default function CatchAllPage() {
  notFound();
}
