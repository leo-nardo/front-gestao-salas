/**
 * Helpers para montar as rotas de um módulo.
 *
 * Os paths NÃO levam o prefixo de idioma: o `@/components/link` e o
 * `useRouter` customizado cuidam disso. Quem precisar do path completo
 * (redirects de servidor, `getRoleRedirectPath`) deve prefixar `/${language}`.
 */

export type ListRoutes = {
  list: () => string;
};

export type CrudRoutes = ListRoutes & {
  create: () => string;
};

/** Segmento da tela de criação, concordando com o gênero do recurso. */
export type CreateSegment = "novo" | "nova";

/** Acrescenta query string ao path, ignorando valores vazios. */
export function withQuery(
  path: string,
  params: Record<string, string | number | null | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function listRoutes(base: string): ListRoutes {
  return { list: () => base };
}

export function crudRoutes(
  base: string,
  create: CreateSegment = "novo"
): CrudRoutes {
  return {
    list: () => base,
    create: () => `${base}/${create}`,
  };
}
