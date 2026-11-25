"use client";

import { ReactNode } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";

// Qualquer usuário autenticado (sem restrição de perfil) acessa o /profile.
function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default withPageRequiredAuth(ProfileLayout);
