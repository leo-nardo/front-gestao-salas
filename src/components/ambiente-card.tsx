import Edit from "lucide-react/dist/esm/icons/edit";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <Card className="hover:border-primary/30 transition-colors p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-mono font-medium text-muted-foreground">
          {ambiente.id.split("-")[0].toUpperCase()}
        </div>
        <Badge
          className={getTipoAmbienteBadgeClasses(ambiente.tipoAmbiente.nome)}
        >
          {ambiente.tipoAmbiente.nome}
        </Badge>
      </div>

      <div className="mb-4 flex-1">
        <h3 className="text-lg font-semibold text-foreground leading-tight mb-2 line-clamp-2">
          {ambiente.nome}
        </h3>

        <Badge variant="outline" className="font-normal text-xs mb-4">
          {ambiente.tipo === "Reservável" ? "Reservável" : "Grade fixa"}
        </Badge>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>{ambiente.capacidade} lugares</span>
          </div>
          {(ambiente.andar || ambiente.bloco) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {[
                  ambiente.andar ? `Andar ${ambiente.andar.nome}` : null,
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
              className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md border"
            >
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md border">
              +{features.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t mt-auto">
        <Link
          href={`/admin/ambientes/${ambiente.id}/editar`}
          className="flex-1 min-w-[25%]"
        >
          <Button variant="outline" size="sm" className="w-full h-9 px-2">
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
            className="w-full h-9 px-2 text-primary"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Agenda
          </Button>
        </Link>
      </div>
    </Card>
  );
}
