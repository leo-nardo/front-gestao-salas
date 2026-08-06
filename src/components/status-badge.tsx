import React from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeProps = {
  status: "confirmada" | "pendente" | "conflito" | "info";
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    confirmada: "bg-[#e6f2ea] text-[#2f7d4f]",
    pendente: "bg-[#f6eede] text-[#b26a12]",
    conflito: "bg-[#f7e7e2] text-[#a8442f]",
    info: "bg-[#e7edf8] text-[#3a4a99]",
  };

  const statusLabels = {
    confirmada: "Confirmada",
    pendente: "Pendente",
    conflito: "Conflito",
    info: "Info",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
