import Edit from "lucide-react/dist/esm/icons/edit";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ambiente } from "@/services/api/services/ambientes";
import { getTipoAmbienteBadgeClasses } from "@/lib/tipo-ambiente-colors";

interface AmbienteCardProps {
  ambiente: Ambiente;
  language: string;
}

export function AmbienteCard({ ambiente }: AmbienteCardProps) {
  const features = ambiente.descricao
    ? ambiente.descricao
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-xl border border-[#e6e5e0] hover:border-[#c1d0e8] transition-colors p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-mono font-medium text-[#6f767b]">
          {ambiente.id.split("-")[0].toUpperCase()}
        </div>
        <Badge
          className={getTipoAmbienteBadgeClasses(ambiente.tipoAmbiente.nome)}
        >
          {ambiente.tipoAmbiente.nome}
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
                  ambiente.andar ? `${ambiente.andar.nome}º andar` : null,
                  ambiente.bloco ? `Bloco ${ambiente.bloco.nome}` : null,
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

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#f0efea] mt-auto">
        <Link
          href={`/admin/ambientes/${ambiente.id}/editar`}
          className="flex-1 min-w-[25%]"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 px-2 border-[#dddbd3] text-[#1c1f21]"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
        </Link>
        <Link
          href={`/admin/ensalamento?ambiente=${ambiente.id}`}
          className="flex-1 min-w-[25%]"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 px-2 border-[#dddbd3] text-[#1a4f8a]"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Agenda
          </Button>
        </Link>
      </div>
    </div>
  );
}
