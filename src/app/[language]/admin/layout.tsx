"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eceae4] font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AdminLayout, { roles: [RoleEnum.ADMIN] });
