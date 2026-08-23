"use client";

import { ReactNode } from "react";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import { RoleSidebar } from "@/components/role-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const navItems = [
  { title: "Minha Grade", href: "/aluno/grade", icon: Calendar },
  { title: "Eventos", href: "/aluno/eventos", icon: CalendarDays },
];

function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <RoleSidebar menuLabel="Menu do Aluno" navItems={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AlunoLayout, { roles: [RoleEnum.ALUNO] });
