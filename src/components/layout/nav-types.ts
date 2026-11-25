import type { ComponentType } from "react";

export type NavItem = {
  name: string;
  /** Caminho sem o prefixo de idioma, ex.: "/admin/ambientes". */
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Marca o item como ativo só quando o caminho é exatamente igual. */
  exact?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};
