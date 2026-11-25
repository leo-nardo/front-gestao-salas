"use client";

import { ReactNode } from "react";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Menu do Técnico",
    items: [
      {
        name: "Itens patrimoniais",
        href: "/tecnico/patrimonio",
        icon: FlaskConical,
      },
    ],
  },
];

function TecnicoLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell groups={groups} mainClassName="p-8">
      {children}
    </AppShell>
  );
}

export default withPageRequiredAuth(TecnicoLayout, {
  roles: [RoleEnum.TECNICO_LABORATORIO],
});
