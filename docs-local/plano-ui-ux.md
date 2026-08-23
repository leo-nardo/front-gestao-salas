# Plano — Consolidação de UI/UX do front-gestao-salas

Objetivo: elevar todas as telas ao nível da tela de Ensalamento (que você
gostou), revisando componente por componente, sem tocar no backend a menos
que seja estritamente necessário.

Status: **PLANO — nada foi executado ainda.**

---

## Diagnóstico (por que as telas parecem inconsistentes)

Já existe um **design system completo e correto** em `src/app/globals.css` —
tokens shadcn (`--primary`, `--muted-foreground`, `--border`, `--destructive`,
`--surface-1..4`, etc.), com paleta clara e (potencialmente) modo escuro.
**O problema não é falta de sistema — é que quase nenhuma tela usa os tokens.**
Toda tela (incluindo o `AdminHeader` compartilhado, usado em TODA página
admin, e até a própria tela de Ensalamento) reescreve os mesmos valores em
hex direto: `bg-[#1a4f8a]`, `text-[#6f767b]`, `border-[#dddbd3]` — e esses
hex **são exatamente os mesmos valores** já definidos como token (confirmei:
`--primary: #1a4f8a`, `--muted-foreground: #6f767b`, `--border: #dddbd3`).
Contei 135+ ocorrências desse padrão só com as cores principais.

Ou seja: o "gostei do Ensalamento, as outras estão feias" não é bem sobre a
tela de Ensalamento ter um sistema melhor — é sobre a **interação/organização**
dela (filtros, visões salvas, grade de horário) ser mais elaborada. Na
questão de cores cruas ela tem exatamente o mesmo problema das outras.

### Outros problemas sistêmicos encontrados

1. **Confirmação de exclusão via `window.confirm()`** nas telas de lista
   simples (blocos, andares, tipos-ambiente, etc.) — popup feio do navegador,
   não estilizável, bloqueia a thread. O componente `AlertDialog` (shadcn) já
   está instalado mas não é usado pra isso em lugar nenhum.
2. **Fetch de dados de formulário inconsistente**: telas de lista usam
   `@tanstack/react-query` (bom, com cache), mas telas de formulário (ex:
   `ambientes/novo`) buscam dados relacionados (unidades, tipos, blocos) via
   `useEffect` + `useState` cru, sem cache, sem estado de loading, e engolindo
   erro com `.catch(console.error)` — se a chamada falhar, o campo fica
   silenciosamente vazio sem avisar o usuário.
3. **Sem componente `Form` do shadcn instalado** (`src/components/ui/` tem
   23 componentes, mas falta `form.tsx`, `card.tsx`, `tabs.tsx`,
   `pagination`). Cada formulário monta `<Label>` + `<Input>` + mensagem de
   erro manualmente, sem padronização de espaçamento/estrutura.
4. **Erros de validação do backend (422) não aparecem no formulário.** O
   catch genérico só dispara um toast fixo ("Erro ao criar..."), nunca mapeia
   o campo específico que falhou no servidor pro campo do formulário.
5. **Listas simples sem paginação real** — buscam tudo com `limit: 500` e
   renderizam uma tabela HTML crua. Funciona hoje (poucos registros), mas não
   escala e não tem busca/ordenação/filtro.
6. **Ícones importados via caminho profundo** (`lucide-react/dist/esm/icons/x`)
   em vez de `import { X } from "lucide-react"` — inconsistente, sem ganho
   real (o pacote já faz tree-shaking via ESM padrão).
7. **Sem tela de CRUD para `Curso`** — curso só existe como dado embutido em
   outros formulários (turma, disciplina). Não sei se é intencional (curso é
   fixo/vindo só do seed) ou uma lacuna — vou perguntar antes de mexer nisso.

### Telas mapeadas (13 recursos com padrão lista+criar+editar)

`ambientes`, `andares`, `aulas`, `blocos`, `disciplinas`, `equipamentos`,
`patrimonio`, `reservas`, `solicitacoes`, `tipos-ambiente`, `turmas`,
`usuarios` — todas geradas originalmente pelo gerador hygen do projeto
(`npm run generate:resource` / `.hygen/generate/resource/*.ejs.t`).

Telas por papel (fora do admin): `aluno/grade`, `aluno/eventos`,
`professor/aulas`, `professor/reservas`, `professor/equipamentos`,
`auxiliar/equipamentos`, `auxiliar/solicitacoes*`, `limpeza/agenda`,
`limpeza/ambientes`, `tecnico/patrimonio` — mesmo padrão visual, mesmos
problemas.

Tela de referência (interação boa, cores cruas mas será corrigida junto):
`admin/ensalamento`.

---

## Correção de rota (achada ao iniciar a Fase 1)

Os templates hygen (`.hygen/generate/resource/*.ejs.t`) geram telas em
`/admin-panel/<recurso>` seguindo o padrão genérico do boilerplate
(`TableVirtuoso`, `useConfirmDialog` do próprio boilerplate, i18n via
`useTranslation`). **Só `/admin-panel/users` usa esse padrão.** Todas as 12
telas de domínio reais (`blocos`, `ambientes`, `disciplinas`, `turmas`,
`aulas`, etc., em `/admin/<recurso>`) foram escritas à mão desde o início,
sem passar pelo gerador — não seguem o template nem usam os componentes que
ele importa.

**Consequência:** consertar os templates do gerador teria efeito zero nas
telas que o usuário realmente usa. Cancelo a antiga "Fase 1" como prioridade
e vou direto pro retrofit das telas reais. Só vale a pena mexer no gerador
depois, se algum dia for criado um recurso novo por ele — não é o caso agora.

**Bônus descoberto:** o boilerplate já tem um `useConfirmDialog()` pronto
(`src/components/confirm-dialog/`, Provider já montado no layout raiz,
API baseada em Promise: `await confirmDialog({ title, message })`). Removi
o `ConfirmDialog` que eu tinha criado do zero na Fase 0 — era redundante.
Todo retrofit usa o hook existente, não um componente novo.

## Estratégia: consertar a origem, depois propagar

Como a maioria das telas simples vem do **gerador hygen**
(`.hygen/generate/resource/*.ejs.t`), tem dois níveis de trabalho:

1. **Consertar os templates do gerador** — assim qualquer novo recurso
   gerado no futuro (`npm run generate:resource`) já nasce correto. Baixo
   risco: são templates de scaffolding, não tocam em lógica de negócio.
2. **Retrofitar as telas já existentes** — aplicar manualmente o mesmo
   padrão corrigido em cada uma das ~22 telas já geradas (12 recursos admin +
   10 telas de papel), já que regenerar por cima arriscaria perder lógica
   customizada que cada uma já ganhou depois de gerada.

Backend: **não deve precisar de nenhuma mudança.** Os problemas são 100%
de camada de apresentação (cor, componente, estado de loading/erro). Only
exception prevista: se o mapeamento de erro 422→campo do formulário exigir
que o backend padronize melhor o formato de `errors` em alguma resposta —
vou verificar caso a caso e avisar antes de mexer, não vou assumir.

---

## Fase 0 — Fundação (construir antes de tocar em qualquer tela)

Componentes/utilitários novos, reaproveitados por tudo depois:

1. **`ConfirmDialog`** — wrapper fino sobre `AlertDialog` (já instalado) pra
   substituir todo `window.confirm()`. Uma função/hook `useConfirm()` ou
   componente controlado, usado igual em toda tela de lista.
2. **`DataTable`** — tabela genérica com paginação, busca simples, estado de
   loading (skeleton, não spinner) e estado vazio padronizado, construída em
   cima do `Table` já existente. Não preciso de `@tanstack/react-table` pra
   isso — dá pra fazer simples e leve, mas vou avaliar se compensa instalar
   (perguntar antes de adicionar dependência nova).
3. **Instalar componentes shadcn faltantes**: `form`, `card`, `tabs`
   (`npx shadcn add form card tabs`) — o `form.tsx` do shadcn já integra
   com `react-hook-form` (`FormField`, `FormItem`, `FormMessage`), elimina
   boilerplate manual de label+erro em todo formulário.
4. **`useApiFormError` (ou similar)** — helper que pega uma resposta 422 do
   backend (`{ errors: Record<string,string> }`, padrão já usado nos DTOs)
   e chama `form.setError(campo, ...)` automaticamente, em vez de só um
   toast genérico.
5. **Padronizar fetch de dados relacionados em formulários**: sempre via
   `useQuery` (igual as listas já fazem), nunca `useEffect`+`useState` cru.
6. **Auditoria de cores**: rodar um find-and-replace assistido (não cego)
   trocando os hex conhecidos pelos tokens equivalentes — tabela abaixo.

| Hex usado hoje | Token correto |
|---|---|
| `#1a4f8a` / `#123c6e` (hover) | `bg-primary` / `hover:bg-primary/90` |
| `#a8442f` | `text-destructive` / `bg-destructive` |
| `#f7e7e2` | `bg-destructive-bg` |
| `#6f767b` | `text-muted-foreground` |
| `#1c1f21` | `text-foreground` |
| `#dddbd3` | `border-border` / `border-input` |
| `#f0efea` | `bg-secondary` / `bg-surface-1` |
| `#f2f1ec` | `bg-muted` / `bg-surface-2` |
| `#faf9f5` | `bg-surface-3` |
| `#fbfaf7` | `bg-surface-4` |
| `#e7edf8` / `#3a4a99` | `bg-accent` / `text-accent-foreground` (ou `info`/`info-bg`) |
| `#ffffff` (cards) | `bg-card` |

---

## Fase 1 — Consertar os templates do gerador

Aplicar a Fase 0 dentro de:
- `.hygen/generate/resource/page-content.ejs.t` (tela de lista)
- `.hygen/generate/resource/admin-panel-create.ejs.t` / `admin-panel-edit.ejs.t` (formulários)
- `.hygen/generate/field/*.ejs.t` (campos individuais dentro do formulário)

Testar gerando um recurso descartável (`npm run generate:resource` num nome
de teste, conferir visualmente, depois descartar) antes de considerar pronto.

---

## Fase 2 — Retrofit das 12 telas de recurso admin (lista + criar + editar)

Progresso: **11 de 12 concluídos** (23/08).

1. ✅ `blocos` — referência do padrão novo (ver abaixo)
2. ✅ `andares`, ✅ `tipos-ambiente` (mesma estrutura de `blocos`)
3. ✅ `disciplinas`, ✅ `turmas` (form + select de Curso via useQuery)
4. ✅ `equipamentos` (mantido grid de cards já existente, só tokens+useQuery)
5. ✅ `ambientes` — form mais complexo até agora (8 campos, select
   condicional, sentinels "none" pra bloco/andar opcionais). Corrigido de
   quebra um bug de texto real no `AmbienteCard` ("1ºº andar").
6. ✅ `patrimonio` — form com `backHref`/`onSaved` (preserva `?ambiente=` da
   listagem), `DataTable` + `useConfirmDialog()`.
7. ✅ `reservas` — sem form compartilhado (único consumidor), conflito 409
   tratado inline com banner próprio; listagem em `Card`s (somente leitura).
8. ✅ `solicitacoes` — fluxo de aprovar/rejeitar mantido intacto, só
   badges/skeleton retrofitados pra tokens.
9. ✅ `aulas` — o mais complexo: `aula-form.tsx` compartilhado com filtros em
   cascata (curso → disciplina/turma), professor filtrado por
   `RoleEnum.PROFESSOR`, injeção de horário fora da grade (ex: "22:30") pra
   edição, `ConflictBanner` retrofitado pra tokens (estava com hex direto).
   Criado `src/lib/curso-colors.ts` (mesmo padrão hash de
   `tipo-ambiente-colors.ts`) pra colorir a faixa lateral por curso — o mapa
   antigo (`courseColors`) só cobria 5 dos 16 cursos reais, deixando a
   maioria sem cor. Removido `<StatusBadge status="confirmada" />`: `Aula`
   não tem campo de status real, o badge sempre mostrava "Confirmada" pra
   todas as linhas independente do estado real.
10. **Falta**: `usuarios` — o mais sensível (fluxo de convite/primeiro
    acesso já implementado — mexer com cuidado pra não regredir isso).

### Padrão de referência (`blocos`, 18/08)

- `blocos/bloco-form.tsx`: componente de formulário compartilhado entre
  `novo` e `[id]/editar` (evita duplicar os mesmos campos duas vezes). Usa
  `Card` + `Form`/`FormField` do shadcn, `applyApiFormErrors` no catch,
  chama `onSave` (a service function específica de create/update) e cuida
  do resto (loading do botão, toast, redirect) — a página só passa o quê
  chamar, não como.
- `page-content.tsx` (lista): `DataTable` novo + `useConfirmDialog()` do
  boilerplate em vez de `window.confirm()`.
- `[id]/editar/page-content.tsx`: `Skeleton` em vez de spinner enquanto
  carrega os dados existentes.
- Zero hex cru — só tokens (`bg-card`, `text-muted-foreground`,
  `border-destructive`, etc.).
- Para recursos com mais campos relacionados (select de outra entidade),
  trocar o `useEffect`+`useState` manual por `useQuery` (já é o padrão nas
  telas de lista, só falta nos formulários).

`andares` e `tipos-ambiente` são idênticos a `blocos` em estrutura (mesmos
2 campos, mesmo CRUD) — retrofit é replicar o mesmo arquivo trocando nomes.

## Fase 3 — Retrofit das telas por papel

`aluno/*`, `professor/*`, `auxiliar/*`, `limpeza/*`, `tecnico/*` — mesmo
padrão da Fase 2, adaptado pro que cada tela já faz.

## Fase 4 — Ensalamento e componentes compartilhados

- Aplicar a troca de cores no `AdminHeader`, `block-detail-sheet.tsx` e
  demais componentes de `src/components/ensalamento/`.
- Não mexer na lógica/interação da tela (é a referência boa) — só cor e,
  se fizer sentido, o `ConfirmDialog` novo em vez de qualquer confirm nativo
  que exista lá.

## Fase 5 — Revisão final

- Testar visualmente cada tela (rodar local, navegar por todas).
- Rodar `npm run lint` / build de produção pra garantir que nada quebrou.
- Conferir que os toasts de erro/sucesso continuam consistentes em todo
  lugar.

---

## Decisões (resolvidas sem precisar perguntar)

1. **`Curso` sem tela própria de CRUD** — vou criar uma tela simples (lista +
   criar + editar), igual às outras entidades de referência (`blocos`,
   `andares`, `tipos-ambiente`). Consistência > economia de uma tela.
2. **Paginação/ordenação das listas** — não vou instalar
   `@tanstack/react-table`. O volume de dados é pequeno (dezenas de linhas
   por recurso), então uma paginação simples + busca client-side dentro do
   `DataTable` novo (Fase 0) resolve sem dependência nova. Reavalio se algum
   recurso crescer muito (ex: `disciplinas` com 388 registros hoje é o mais
   pesado — esse aí já nasce com paginação de verdade desde o início).
3. **Cadência de commit** — um commit por fase (0 a 5), push pro `main` ao
   final de cada fase concluída e validada. Mantém o histórico legível e dá
   pontos de rollback caso algo quebre no meio do caminho.

---

## Próximo passo

Plano fechado. Início pela Fase 0 (fundação): `ConfirmDialog`, `DataTable`,
instalar `form`/`card`/`tabs` do shadcn, helper de erro 422→campo, e a
troca de cores por token nos componentes compartilhados primeiro
(`AdminHeader`, etc.) antes de tocar tela por tela.
