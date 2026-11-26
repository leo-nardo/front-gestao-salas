"use client";

import { routes } from "@/routes";
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
      {
        name: "Dashboard",
        href: routes.home.admin(),
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Ensalamento",
        href: routes.ensalamento.admin.list(),
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: "Espaços e recursos",
    items: [
      {
        name: "Ambientes",
        href: routes.ambientes.admin.list(),
        icon: DoorOpen,
      },
      {
        name: "Tipos de Ambiente",
        href: routes.tiposAmbiente.admin.list(),
        icon: Tags,
      },
      { name: "Blocos", href: routes.blocos.admin.list(), icon: Building },
      { name: "Andares", href: routes.andares.admin.list(), icon: Layers3 },
      {
        name: "Patrimônio",
        href: routes.patrimonio.admin.list(),
        icon: ClipboardList,
      },
      {
        name: "Equipamentos",
        href: routes.equipamentos.admin.list(),
        icon: MonitorPlay,
      },
    ],
  },
  {
    title: "Acadêmico",
    items: [
      { name: "Cursos", href: routes.cursos.admin.list(), icon: School },
      {
        name: "Disciplinas",
        href: routes.disciplinas.admin.list(),
        icon: BookOpen,
      },
      { name: "Turmas", href: routes.turmas.admin.list(), icon: Layers },
      { name: "Aulas", href: routes.aulas.admin.list(), icon: GraduationCap },
    ],
  },
  {
    title: "Operação",
    items: [
      {
        name: "Reservas",
        href: routes.reservas.admin.list(),
        icon: CalendarClock,
      },
      {
        name: "Solicitações de troca",
        href: routes.solicitacoes.admin.list(),
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    title: "Administração",
    items: [
      { name: "Usuários", href: routes.usuarios.admin.list(), icon: Users },
    ],
  },
];

function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell groups={groups}>{children}</AppShell>;
}

export default withPageRequiredAuth(AdminLayout, { roles: [RoleEnum.ADMIN] });
