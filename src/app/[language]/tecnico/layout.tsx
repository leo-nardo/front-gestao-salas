"use client";

import { ReactNode } from "react";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import { RoleSidebar } from "@/components/role-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const navItems = [
  {
    title: "Itens patrimoniais",
    href: "/tecnico/patrimonio",
    icon: FlaskConical,
  },
];

function TecnicoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <RoleSidebar menuLabel="Menu do Técnico" navItems={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(TecnicoLayout, {
  roles: [RoleEnum.TECNICO_LABORATORIO],
});
