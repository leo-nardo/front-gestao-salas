import React from "react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

type ConflictBannerProps = {
  status: "checking" | "available" | "conflict";
  message?: string;
};

export function ConflictBanner({ status, message }: ConflictBannerProps) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-[#e7edf8] text-[#3a4a99] border border-[#cad6e8]">
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        <span className="text-sm font-medium">
          Verificando disponibilidade…
        </span>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-[#e6f2ea] text-[#2f7d4f] border border-[#b3dcc5]">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">✓ Horário disponível</span>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-[#f7e7e2] text-[#a8442f] border border-[#e6b3a6]">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">
          {message || "Conflito detectado neste horário e ambiente"}
        </span>
      </div>
    );
  }

  return null;
}
