"use client";

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
      { name: "Minhas Aulas", href: "/professor/aulas", icon: Calendar },
      {
        name: "Minhas Reservas",
        href: "/professor/reservas",
        icon: CalendarPlus,
      },
      {
        name: "Equipamentos",
        href: "/professor/equipamentos",
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
