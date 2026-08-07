"use client";

import { ComponentType } from "react";
import Link from "@/components/link";
import { usePathname } from "next/navigation";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import { cn } from "@/lib/utils";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuth from "@/services/auth/use-auth";

export type RoleNavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type RoleSidebarProps = {
  menuLabel: string;
  navItems: RoleNavItem[];
};

export function RoleSidebar({ menuLabel, navItems }: RoleSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logOut } = useAuthActions();

  return (
    <aside className="w-[280px] bg-[#15294c] flex flex-col h-full shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white font-public-sans tracking-tight">
          Ambienta<span className="text-[#89a8d6]">.</span>
        </h2>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-[#89a8d6] uppercase tracking-wider mb-4 px-2">
          {menuLabel}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1e3a68] text-white"
                    : "text-[#cad6e8] hover:bg-[#1a325c] hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Link
          href="/profile"
          className="bg-[#10203d] rounded-xl p-4 flex items-center gap-3 mb-4 hover:bg-[#152a4d] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#1e3a68] flex items-center justify-center text-white font-bold shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#89a8d6] truncate">{user?.email}</p>
          </div>
        </Link>

        <button
          onClick={logOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-[#cad6e8] hover:bg-[#1a325c] hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
