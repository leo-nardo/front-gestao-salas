"use client";

import { ReactNode } from "react";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Menu do Aluno",
    items: [
      { name: "Minha Grade", href: "/aluno/grade", icon: Calendar },
      { name: "Eventos", href: "/aluno/eventos", icon: CalendarDays },
    ],
  },
];

function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell groups={groups} mainClassName="p-8">
      {children}
    </AppShell>
  );
}

export default withPageRequiredAuth(AlunoLayout, {
  roles: [RoleEnum.ALUNO],
});
