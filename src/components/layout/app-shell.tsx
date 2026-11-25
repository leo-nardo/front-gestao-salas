"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  hydrateLayoutSettings,
  useLayoutSettings,
} from "@/stores/layout-store";
import type { NavGroup } from "./nav-types";
import { ShellSidebar } from "./shell-sidebar";

type AppShellProps = {
  groups: NavGroup[];
  children: ReactNode;
  /** Classes extras da área principal, ex.: "p-8". */
  mainClassName?: string;
};

/**
 * Shell único das áreas autenticadas: barra lateral de largura ajustável
 * (que pode ser recolhida) e área principal rolável.
 */
export function AppShell({ groups, children, mainClassName }: AppShellProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const { sidebarWidth, sidebarCollapsed } = useLayoutSettings();

  useEffect(() => {
    hydrateLayoutSettings();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <ShellSidebar
        ref={sidebarRef}
        groups={groups}
        width={sidebarWidth}
        collapsed={sidebarCollapsed}
        getSidebarElement={() => sidebarRef.current}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className={cn("flex-1 overflow-y-auto", mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
