"use client";

import { routes } from "@/routes";
import { ReactNode } from "react";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import PackageCheck from "lucide-react/dist/esm/icons/package-check";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Menu do Auxiliar",
    items: [
      {
        name: "Solicitações de troca",
        href: routes.solicitacoes.auxiliar.list(),
        icon: ArrowLeftRight,
      },
      {
        name: "Equipamentos",
        href: routes.equipamentos.auxiliar.list(),
        icon: MonitorPlay,
      },
      {
        name: "Solicitações de Equip.",
        href: routes.solicitacoesEquipamento.auxiliar.list(),
        icon: PackageCheck,
      },
    ],
  },
];

function AuxiliarLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell groups={groups} mainClassName="p-8">
      {children}
    </AppShell>
  );
}

export default withPageRequiredAuth(AuxiliarLayout, {
  roles: [RoleEnum.AUXILIAR_AUDIOVISUAL],
});
