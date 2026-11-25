"use client";

import { routes } from "@/routes";
import { ReactNode } from "react";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Menu da Limpeza",
    items: [
      {
        name: "Ambientes",
        href: routes.ambientes.limpeza.list(),
        icon: Sparkles,
      },
      {
        name: "Agenda",
        href: routes.agenda.limpeza.list(),
        icon: CalendarDays,
      },
    ],
  },
];

function LimpezaLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell groups={groups} mainClassName="p-8">
      {children}
    </AppShell>
  );
}

export default withPageRequiredAuth(LimpezaLayout, {
  roles: [RoleEnum.LIMPEZA],
});
