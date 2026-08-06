"use client";

import { ReactNode } from "react";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import { RoleSidebar } from "@/components/role-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const navItems = [
  {
    title: "Solicitações de troca",
    href: "/auxiliar/solicitacoes",
    icon: ArrowLeftRight,
  },
  {
    title: "Equipamentos",
    href: "/auxiliar/equipamentos",
    icon: MonitorPlay,
  },
];

function AuxiliarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eceae4] font-sans">
      <RoleSidebar menuLabel="Menu do Auxiliar" navItems={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AuxiliarLayout, {
  roles: [RoleEnum.AUXILIAR_AUDIOVISUAL],
});
