# MES Arroz — Painel do Operador (Protótipo de TCC)

Protótipo de SPA (React + Vite + Tailwind) para a interface de operador de um
MES (Manufacturing Execution System) SaaS voltado a pequenas e médias
beneficiadoras de arroz. Integra diretamente com Supabase (`@supabase/supabase-js`).

## ⚠️ Aviso de segurança — RLS desativado

Este protótipo foi combinado para rodar **com Row Level Security (RLS)
desativado** nas tabelas do Supabase, para facilitar os testes de integração
durante o desenvolvimento. Isso significa que a **anon key dá acesso total de
leitura e escrita a qualquer pessoa** que inspecionar o bundle JS publicado
(é trivial — basta abrir as DevTools do navegador).

Antes de qualquer deploy fora de um ambiente estritamente de teste/demo:

1. Ative RLS em todas as tabelas (`empresas`, `lotes`, `laudos`, `producao`,
   `subprodutos`, `paradas`, `residuos`).
2. Crie policies adequadas (ex.: por `id_empresa` vinculado ao usuário
   autenticado via Supabase Auth).
3. Considere mover operações sensíveis para uma Edge Function / rota
   server-side com a `service_role` key (nunca exposta ao cliente).

## Stack

- **Vite + React 18**
- **Tailwind CSS** — tema industrial customizado (`tailwind.config.js`)
- **lucide-react** — ícones
- **recharts** — gráficos do dashboard
- **@supabase/supabase-js** — cliente isolado em `src/lib/supabaseClient.js`

## Estrutura do projeto

```
src/
  lib/
    supabaseClient.js   # cliente Supabase (usa variáveis de ambiente)
    validation.js       # regras de validação de negócio (lote, laudo)
  hooks/
    useEmpresas.js       # carrega empresas e mantém a empresa ativa
  components/
    Sidebar.jsx           # navegação lateral
    Topbar.jsx             # cabeçalho + seletor de empresa
    Toast.jsx               # notificações de sucesso/erro
    FormField.jsx            # campo de formulário padronizado
    StatCard.jsx               # card de estatística do dashboard
  pages/
    Recebimento.jsx    # cadastro de Lote
    Laboratorio.jsx     # cadastro de Laudo
    Producao.jsx          # lançamento de Produção por turno
    Dashboard.jsx           # cards + gráficos + tabela de lotes
  App.jsx
  main.jsx
  index.css
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # já vem preenchido com as credenciais fornecidas
npm run dev
```

Acesse `http://localhost:5173`.

## Validações de negócio implementadas

- **Lote**: umidade deve estar entre 10% e 25% (`src/lib/validation.js`).
- **Laudo**: soma de `inteiros + quebrados + impureza` não pode ultrapassar
  100%. A tela de laboratório também mostra a soma em tempo real, destacando
  em vermelho quando o limite é excedido.

Ambas as validações rodam no frontend antes do `insert` no Supabase. Elas
**não substituem** constraints no banco — para produção, vale replicar essas
regras como `CHECK constraints` nas tabelas.

## Deploy na Vercel

1. Suba este diretório para um repositório Git (GitHub/GitLab/Bitbucket).
2. Na Vercel, importe o repositório — o framework Vite é detectado
   automaticamente.
3. Em **Environment Variables**, configure:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. O `vercel.json` incluído já cuida do rewrite de SPA (rotas
   client-side não retornam 404 ao dar refresh).

## Próximos passos sugeridos (fora do escopo deste protótipo)

- Autenticação de operadores via Supabase Auth + RLS por `id_empresa`.
- Telas para as tabelas `subprodutos`, `paradas` e `residuos`.
- Paginação nas listagens (hoje limitadas a 8–50 registros mais recentes).
- Testes automatizados para `src/lib/validation.js`.
