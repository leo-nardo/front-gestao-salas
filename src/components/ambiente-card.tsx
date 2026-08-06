import Edit from "lucide-react/dist/esm/icons/edit";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ambiente } from "@/services/api/services/ambientes";

interface AmbienteCardProps {
  ambiente: Ambiente;
  language: string;
}

export function AmbienteCard({ ambiente }: AmbienteCardProps) {
  // Try to parse some characteristics from descricao or use defaults if not present
  const features = ambiente.descricao
    ? ambiente.descricao
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "Laboratório":
        return "bg-[#f7e7e2] text-[#a8442f] hover:bg-[#f7e7e2]/80 border-transparent";
      default:
        return "bg-[#e7edf8] text-[#3a4a99] hover:bg-[#e7edf8]/80 border-transparent";
    }
  };

  const getCategoryLabel = (categoria: string) => {
    if (categoria === "Laboratório") return "Lab.";
    return categoria || "Sala";
  };

  return (
    <div className="bg-white rounded-xl border border-[#e6e5e0] hover:border-[#c1d0e8] transition-colors p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-mono font-medium text-[#6f767b]">
          {ambiente.id.split("-")[0].toUpperCase()}
        </div>
        <Badge className={getCategoryColor(ambiente.categoria)}>
          {getCategoryLabel(ambiente.categoria)}
        </Badge>
      </div>

      <div className="mb-4 flex-1">
        <h3 className="text-lg font-semibold text-[#1c1f21] leading-tight mb-2 line-clamp-2">
          {ambiente.nome}
        </h3>

        <Badge
          variant="outline"
          className="text-[#6f767b] border-[#dddbd3] font-normal text-xs mb-4"
        >
          {ambiente.tipo === "Reservável" ? "Reservável" : "Grade fixa"}
        </Badge>

        <div className="space-y-2 text-sm text-[#6f767b]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>{ambiente.capacidade} lugares</span>
          </div>
          {(ambiente.andar || ambiente.bloco) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {[
                  ambiente.andar ? `${ambiente.andar}º andar` : null,
                  ambiente.bloco ? `Bloco ${ambiente.bloco}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {features.slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="text-xs bg-[#f0efea] text-[#6f767b] px-2 py-0.5 rounded-md border border-[#e6e5e0]"
            >
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="text-xs bg-[#f0efea] text-[#6f767b] px-2 py-0.5 rounded-md border border-[#e6e5e0]">
              +{features.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-[#f0efea] mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 border-[#dddbd3] text-[#1c1f21]"
        >
          <Edit className="w-3.5 h-3.5 mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 border-[#dddbd3] text-[#1a4f8a]"
        >
          <Calendar className="w-3.5 h-3.5 mr-2" />
          Ver agenda
        </Button>
      </div>
    </div>
  );
}
