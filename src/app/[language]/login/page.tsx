import type { Metadata } from "next";
import LoginPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Entrar | Gestão de Espaços Acadêmicos",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
