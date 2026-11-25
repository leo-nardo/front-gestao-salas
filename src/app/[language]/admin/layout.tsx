"use client";

import { ReactNode } from "react";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import DoorOpen from "lucide-react/dist/esm/icons/door-open";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Layers from "lucide-react/dist/esm/icons/layers";
import Users from "lucide-react/dist/esm/icons/users";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import Tags from "lucide-react/dist/esm/icons/tags";
import Building from "lucide-react/dist/esm/icons/building";
import Layers3 from "lucide-react/dist/esm/icons/layers-3";
import School from "lucide-react/dist/esm/icons/school";
import { AppShell } from "@/components/layout/app-shell";
import type { NavGroup } from "@/components/layout/nav-types";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const groups: NavGroup[] = [
  {
    title: "Visão geral",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { name: "Ensalamento", href: "/admin/ensalamento", icon: LayoutGrid },
    ],
  },
  {
    title: "Espaços e recursos",
    items: [
      { name: "Ambientes", href: "/admin/ambientes", icon: DoorOpen },
      { name: "Tipos de Ambiente", href: "/admin/tipos-ambiente", icon: Tags },
      { name: "Blocos", href: "/admin/blocos", icon: Building },
      { name: "Andares", href: "/admin/andares", icon: Layers3 },
      { name: "Patrimônio", href: "/admin/patrimonio", icon: ClipboardList },
      { name: "Equipamentos", href: "/admin/equipamentos", icon: MonitorPlay },
    ],
  },
  {
    title: "Acadêmico",
    items: [
      { name: "Cursos", href: "/admin/cursos", icon: School },
      { name: "Disciplinas", href: "/admin/disciplinas", icon: BookOpen },
      { name: "Turmas", href: "/admin/turmas", icon: Layers },
      { name: "Aulas", href: "/admin/aulas", icon: GraduationCap },
    ],
  },
  {
    title: "Operação",
    items: [
      { name: "Reservas", href: "/admin/reservas", icon: CalendarClock },
      {
        name: "Solicitações de troca",
        href: "/admin/solicitacoes",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    title: "Administração",
    items: [{ name: "Usuários", href: "/admin/usuarios", icon: Users }],
  },
];

function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell groups={groups}>{children}</AppShell>;
}

export default withPageRequiredAuth(AdminLayout, { roles: [RoleEnum.ADMIN] });
