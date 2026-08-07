"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import DoorOpen from "lucide-react/dist/esm/icons/door-open";
import MonitorPlay from "lucide-react/dist/esm/icons/monitor-play";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Layers from "lucide-react/dist/esm/icons/layers";
import Users from "lucide-react/dist/esm/icons/users";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    title: "COORDENAÇÃO",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        color: "bg-blue-400",
        exact: true,
      },
      {
        name: "Ensalamento",
        href: "/admin/ensalamento",
        icon: LayoutGrid,
        color: "bg-sky-400",
      },
      {
        name: "Ambientes",
        href: "/admin/ambientes",
        icon: DoorOpen,
        color: "bg-emerald-400",
      },
      {
        name: "Equipamentos",
        href: "/admin/equipamentos",
        icon: MonitorPlay,
        color: "bg-amber-400",
      },
      {
        name: "Disciplinas",
        href: "/admin/disciplinas",
        icon: BookOpen,
        color: "bg-rose-400",
      },
      {
        name: "Turmas",
        href: "/admin/turmas",
        icon: Layers,
        color: "bg-cyan-400",
      },
      {
        name: "Aulas",
        href: "/admin/aulas",
        icon: Users,
        color: "bg-purple-400",
      },
      {
        name: "Usuários",
        href: "/admin/usuarios",
        icon: Users,
        color: "bg-teal-400",
      },
      {
        name: "Reservas",
        href: "/admin/reservas",
        icon: CalendarClock,
        color: "bg-indigo-400",
      },
      {
        name: "Solicitações de troca",
        href: "/admin/solicitacoes",
        icon: ArrowLeftRight,
        color: "bg-orange-400",
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logOut } = useAuthActions();

  // Helper to extract language from path if needed, but we can just do startsWith
  // The structure is /[language]/admin/...
  // We'll strip the language to check isActive
  const checkIsActive = (href: string, exact?: boolean) => {
    // Remove the /[language] prefix to compare
    const pathWithoutLang = pathname.replace(/^\/[^\/]+/, "");
    if (exact) {
      return pathWithoutLang === href;
    }
    return pathWithoutLang.startsWith(href);
  };

  return (
    <aside className="w-[250px] bg-[#15294c] text-[#cad6e8] h-screen sticky top-0 flex flex-col shrink-0">
      {/* Header / Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-white text-[#15294c] flex items-center justify-center font-bold text-lg">
          A
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          Ambienta
        </span>
      </div>

      {/* Institutional Selector */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-between bg-[#1e3461] hover:bg-[#2a4277] transition-colors p-2 rounded-md text-sm text-white">
          <div className="flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
              H
            </div>
            <span className="truncate">Faculdade Horizonte</span>
          </div>
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-thin scrollbar-thumb-[#1e3461]">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-[#6a7ea0] font-mono tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = checkIsActive(item.href, item.exact);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                        isActive
                          ? "bg-[#1e3461] text-white font-medium"
                          : "hover:bg-[#1e3461]/50 hover:text-white"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-[#1e3461] mt-auto">
        <Link
          href="/profile"
          className="flex items-center gap-3 mb-4 rounded-md p-1 -m-1 hover:bg-[#1e3461]/50 transition-colors"
        >
          <Avatar className="h-10 w-10 border border-[#1e3461]">
            <AvatarImage src="" alt={user?.firstName || "Usuário"} />
            <AvatarFallback className="bg-[#1e3461] text-white">
              {user?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#cad6e8] truncate">
              {user?.role?.name || "Administrador"}
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-[#cad6e8] hover:text-white hover:bg-[#1e3461] h-9 px-2"
          onClick={logOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair do sistema
        </Button>
      </div>
    </aside>
  );
}
