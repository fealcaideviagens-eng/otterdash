-- Verificar e corrigir relacionamentos entre tabelas

-- 1. Garantir que client.id seja NOT NULL e referencie auth.users
ALTER TABLE public.client 
ALTER COLUMN id SET NOT NULL;

-- Adicionar foreign key para client.id -> auth.users.id
ALTER TABLE public.client 
ADD CONSTRAINT client_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Corrigir ops_registry: id deve ser user_id NOT NULL
ALTER TABLE public.ops_registry 
ALTER COLUMN id SET NOT NULL;

-- Renomear coluna id para user_id para melhor clareza
ALTER TABLE public.ops_registry 
RENAME COLUMN id TO user_id;

-- Adicionar foreign key para ops_registry.user_id -> auth.users.id
ALTER TABLE public.ops_registry 
ADD CONSTRAINT ops_registry_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Corrigir ops_completed: id deve ser user_id NOT NULL
ALTER TABLE public.ops_completed 
ALTER COLUMN id SET NOT NULL;

-- Renomear coluna id para user_id para melhor clareza
ALTER TABLE public.ops_completed 
RENAME COLUMN id TO user_id;

-- Adicionar foreign key para ops_completed.user_id -> auth.users.id
ALTER TABLE public.ops_completed 
ADD CONSTRAINT ops_completed_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar foreign key para ops_completed.ops_id -> ops_registry.ops_id
ALTER TABLE public.ops_completed 
ADD CONSTRAINT ops_completed_ops_id_fkey 
FOREIGN KEY (ops_id) REFERENCES public.ops_registry(ops_id) ON DELETE CASCADE;

-- 4. Corrigir goal: id deve ser user_id NOT NULL
ALTER TABLE public.goal 
ALTER COLUMN id SET NOT NULL;

-- Renomear coluna id para user_id para melhor clareza
ALTER TABLE public.goal 
RENAME COLUMN id TO user_id;

-- Adicionar foreign key para goal.user_id -> auth.users.id
ALTER TABLE public.goal 
ADD CONSTRAINT goal_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Atualizar RLS policies para usar user_id em vez de id
-- ops_registry policies
DROP POLICY IF EXISTS "Users can create their own options" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can view their own options" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can update their own options" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can delete their own options" ON public.ops_registry;

CREATE POLICY "Users can create their own options" ON public.ops_registry
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own options" ON public.ops_registry
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own options" ON public.ops_registry
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own options" ON public.ops_registry
FOR DELETE USING (auth.uid() = user_id);

-- ops_completed policies
DROP POLICY IF EXISTS "Users can create their own completed operations" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can view their own completed operations" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can update their own completed operations" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can delete their own completed operations" ON public.ops_completed;

CREATE POLICY "Users can create their own completed operations" ON public.ops_completed
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own completed operations" ON public.ops_completed
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own completed operations" ON public.ops_completed
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completed operations" ON public.ops_completed
FOR DELETE USING (auth.uid() = user_id);

-- goal policies
DROP POLICY IF EXISTS "Users can create their own goals" ON public.goal;
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goal;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goal;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goal;

CREATE POLICY "Users can create their own goals" ON public.goal
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goals" ON public.goal
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.goal
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.goal
FOR DELETE USING (auth.uid() = user_id);