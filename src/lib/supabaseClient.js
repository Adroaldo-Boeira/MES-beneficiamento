import { createClient } from '@supabase/supabase-js'

// Config isolada do Supabase. As credenciais vêm de variáveis de ambiente
// (.env / .env.local), nunca hardcoded aqui — veja .env.example.
//
// ATENÇÃO (RLS): este protótipo assume que Row Level Security está
// desativado nas tabelas, conforme combinado na fase de prototipação.
// Antes de qualquer deploy fora de ambiente de teste, ative RLS e crie
// policies — sem isso, a anon key dá acesso total de leitura/escrita
// a qualquer pessoa que inspecione o bundle JS do frontend.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env e preencha.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
