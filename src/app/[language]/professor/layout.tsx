"use client";

import { ReactNode } from "react";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CalendarPlus from "lucide-react/dist/esm/icons/calendar-plus";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import { RoleSidebar } from "@/components/role-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const navItems = [
  { title: "Minhas Aulas", href: "/professor/aulas", icon: Calendar },
  { title: "Minhas Reservas", href: "/professor/reservas", icon: CalendarPlus },
  { title: "Equipamentos", href: "/professor/equipamentos", icon: MonitorPlay },
];

function ProfessorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <RoleSidebar menuLabel="Menu do Professor" navItems={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(ProfessorLayout, {
  roles: [RoleEnum.PROFESSOR],
});
