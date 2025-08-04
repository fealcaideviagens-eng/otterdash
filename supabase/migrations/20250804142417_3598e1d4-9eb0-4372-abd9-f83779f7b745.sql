-- Remover políticas RLS existentes que dependem de auth.uid()
DROP POLICY IF EXISTS "Users can view their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can insert their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can update their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can delete their own ops_registry" ON public.ops_registry;

DROP POLICY IF EXISTS "Users can view their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can insert their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can update their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can delete their own ops_completed" ON public.ops_completed;

-- Desabilitar RLS temporariamente para permitir operações com usuários locais
ALTER TABLE public.ops_registry DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_completed DISABLE ROW LEVEL SECURITY;

-- Como alternativa, podemos criar políticas mais permissivas se necessário
-- Para um MVP/teste, vamos permitir todas as operações
-- Em produção, seria necessário implementar autenticação Supabase adequada