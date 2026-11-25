"use client";

import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import PanelLeftClose from "lucide-react/dist/esm/icons/panel-left-close";
import PanelLeftOpen from "lucide-react/dist/esm/icons/panel-left-open";
import Link from "@/components/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import {
  SIDEBAR_COLLAPSED_WIDTH,
  toggleSidebarCollapsed,
} from "@/stores/layout-store";
import type { NavGroup } from "./nav-types";
import { SidebarResizeHandle } from "./sidebar-resize-handle";

type ShellSidebarProps = {
  groups: NavGroup[];
  width: number;
  collapsed: boolean;
  getSidebarElement: () => HTMLElement | null;
};

function stripLanguage(pathname: string) {
  return pathname.replace(/^\/[^/]+/, "");
}

export const ShellSidebar = forwardRef<HTMLElement, ShellSidebarProps>(
  function ShellSidebar({ groups, width, collapsed, getSidebarElement }, ref) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { logOut } = useAuthActions();
    const path = stripLanguage(pathname);

    const isActive = (href: string, exact?: boolean) =>
      exact ? path === href : path === href || path.startsWith(`${href}/`);

    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");
    const initials =
      `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "U";

    return (
      <aside
        ref={ref}
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : width }}
        className="sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground"
      >
        <div
          className={cn(
            "flex items-center gap-3 p-4",
            collapsed && "flex-col px-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground">
            A
          </div>
          {!collapsed && (
            <span className="flex-1 truncate text-xl font-bold tracking-tight text-sidebar-accent-foreground">
              Ambienta
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={toggleSidebarCollapsed}
            aria-label={
              collapsed ? "Expandir barra lateral" : "Recolher barra lateral"
            }
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav
          aria-label="Navegação principal"
          className={cn(
            "min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden",
            collapsed ? "px-2" : "px-3"
          )}
        >
          {groups.map((group, groupIndex) => (
            <div key={group.title ?? groupIndex}>
              {groupIndex > 0 && (
                <div
                  className={cn(
                    "mb-5 h-px bg-sidebar-border",
                    collapsed ? "mx-1" : "mx-3"
                  )}
                />
              )}
              {group.title && !collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
                          collapsed ? "justify-center px-0" : "px-3",
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className={cn(
            "mt-auto border-t border-sidebar-border",
            collapsed ? "p-2" : "p-4"
          )}
        >
          <Link
            href="/profile"
            title={collapsed ? fullName || "Perfil" : undefined}
            className={cn(
              "mb-3 flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-sidebar-accent/50",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-10 w-10 shrink-0 border border-sidebar-border">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                  {fullName}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {user?.email}
                </p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            title={collapsed ? "Sair do sistema" : undefined}
            className={cn(
              "h-9 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "justify-center px-0" : "justify-start px-2"
            )}
            onClick={logOut}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Sair do sistema"}
          </Button>
        </div>

        {!collapsed && (
          <SidebarResizeHandle
            width={width}
            getSidebarElement={getSidebarElement}
          />
        )}
      </aside>
    );
  }
);
