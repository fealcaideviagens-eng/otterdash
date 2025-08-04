-- Verificar e remover as restrições de chave estrangeira existentes
-- que estão impedindo o cadastro de opções com usuários locais

-- Remover a constraint de foreign key se existir
ALTER TABLE public.ops_registry 
DROP CONSTRAINT IF EXISTS registry_id_fkey;

-- Remover também qualquer constraint similar em ops_completed
ALTER TABLE public.ops_completed 
DROP CONSTRAINT IF EXISTS completed_ops_id_fkey;

-- Verificar se existem outras constraints relacionadas
-- e removê-las se necessário para permitir operações com autenticação local

-- Como estamos usando autenticação local (não Supabase auth), 
-- não precisamos dessas restrições de foreign key