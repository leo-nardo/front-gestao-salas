"use client";

import { routes } from "@/routes";
import { ReactNode } from "react";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CalendarPlus from "lucide-react/dist/esm/icons/calendar-plus";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Menu do Professor",
    items: [
      {
        name: "Minhas Aulas",
        href: routes.aulas.professor.list(),
        icon: Calendar,
      },
      {
        name: "Minhas Reservas",
        href: routes.reservas.professor.list(),
        icon: CalendarPlus,
      },
      {
        name: "Equipamentos",
        href: routes.equipamentos.professor.list(),
        icon: MonitorPlay,
      },
    ],
  },
];

function ProfessorLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell groups={groups} mainClassName="p-8">
      {children}
    </AppShell>
  );
}

export default withPageRequiredAuth(ProfessorLayout, {
  roles: [RoleEnum.PROFESSOR],
});
