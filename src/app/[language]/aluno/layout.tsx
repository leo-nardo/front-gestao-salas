"use client";

import { ReactNode } from "react";
import { AlunoSidebar } from "@/components/aluno-sidebar";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eceae4] font-sans">
      <AlunoSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AlunoLayout, { roles: [RoleEnum.ALUNO] });
