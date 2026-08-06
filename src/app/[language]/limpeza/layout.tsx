"use client";

import { ReactNode } from "react";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { RoleSidebar } from "@/components/role-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const navItems = [
  { title: "Ambientes", href: "/limpeza/ambientes", icon: Sparkles },
];

function LimpezaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eceae4] font-sans">
      <RoleSidebar menuLabel="Menu da Limpeza" navItems={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(LimpezaLayout, {
  roles: [RoleEnum.LIMPEZA],
});
