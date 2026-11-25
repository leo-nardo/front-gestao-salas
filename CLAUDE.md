# Project instructions

Next.js 16 admin-panel boilerplate (React 19, TypeScript, shadcn, TanStack Query, react-hook-form, i18next).

## When adding resources or fields

The `generate` skill (see [.claude/skills/generate/SKILL.md](.claude/skills/generate/SKILL.md)) wraps the hygen generators (`npm run generate:resource`, `npm run generate:field`), but they still target the removed `/admin-panel` boilerplate. For new screens, copy the `src/app/[language]/admin/blocos` pattern instead (see "Rotas" below).

## Rotas

Os paths de tela ficam em `src/routes/`, um arquivo por módulo (`blocos.ts`, `reservas.ts`, ...), reexportados em `routes` (`@/routes`). Nunca escreva paths de tela à mão (`"/admin/blocos"`): o ESLint bloqueia. Exemplos:

- `routes.blocos.admin.list()`, `.create()`, `.edit(id)`
- Recurso usado por mais de um perfil tem uma chave por perfil: `routes.reservas.professor.create()`
- Query string: `withQuery(routes.patrimonio.admin.list(), { ambiente: id })`
- Redirect de servidor (precisa do idioma): `withLanguage(language, routes.home.admin())`

Novo módulo = novo arquivo em `src/routes/` (use `crudRoutes`/`listRoutes` de `crud.ts`) + uma linha em `src/routes/index.ts`. Os paths não levam o prefixo de idioma. Páginas novas usam `pageMetadata("Título")` (`@/lib/page-metadata`) no `page.tsx`.

Guards ficam no `layout.tsx` do perfil (`withPageRequiredAuth` com `roles`), não nos `page-content.tsx`.