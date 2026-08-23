import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

type ConflictBannerProps = {
  status: "checking" | "available" | "conflict";
  message?: string;
};

export function ConflictBanner({ status, message }: ConflictBannerProps) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-info-bg text-info border border-info/30">
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        <span className="text-sm font-medium">
          Verificando disponibilidade…
        </span>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-success-bg text-success border border-success/30">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">✓ Horário disponível</span>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive-bg text-destructive border border-destructive/30">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">
          {message || "Conflito detectado neste horário e ambiente"}
        </span>
      </div>
    );
  }

  return null;
}
