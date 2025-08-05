-- Verificar e corrigir relacionamentos entre tabelas (versão corrigida)

-- 1. ops_registry: renomear id para user_id e garantir NOT NULL
DO $$ 
BEGIN
    -- Verificar se a coluna já foi renomeada
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'ops_registry' AND column_name = 'id' AND table_schema = 'public') THEN
        ALTER TABLE public.ops_registry ALTER COLUMN id SET NOT NULL;
        ALTER TABLE public.ops_registry RENAME COLUMN id TO user_id;
    END IF;
END $$;

-- Adicionar foreign key para ops_registry.user_id -> auth.users.id se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'ops_registry_user_id_fkey' 
                   AND table_name = 'ops_registry' AND table_schema = 'public') THEN
        ALTER TABLE public.ops_registry 
        ADD CONSTRAINT ops_registry_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. ops_completed: renomear id para user_id e garantir NOT NULL
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'ops_completed' AND column_name = 'id' AND table_schema = 'public') THEN
        ALTER TABLE public.ops_completed ALTER COLUMN id SET NOT NULL;
        ALTER TABLE public.ops_completed RENAME COLUMN id TO user_id;
    END IF;
END $$;

-- Adicionar foreign keys para ops_completed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'ops_completed_user_id_fkey' 
                   AND table_name = 'ops_completed' AND table_schema = 'public') THEN
        ALTER TABLE public.ops_completed 
        ADD CONSTRAINT ops_completed_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'ops_completed_ops_id_fkey' 
                   AND table_name = 'ops_completed' AND table_schema = 'public') THEN
        ALTER TABLE public.ops_completed 
        ADD CONSTRAINT ops_completed_ops_id_fkey 
        FOREIGN KEY (ops_id) REFERENCES public.ops_registry(ops_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. goal: renomear id para user_id e garantir NOT NULL
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'goal' AND column_name = 'id' AND table_schema = 'public') THEN
        ALTER TABLE public.goal ALTER COLUMN id SET NOT NULL;
        ALTER TABLE public.goal RENAME COLUMN id TO user_id;
    END IF;
END $$;

-- Adicionar foreign key para goal.user_id -> auth.users.id se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'goal_user_id_fkey' 
                   AND table_name = 'goal' AND table_schema = 'public') THEN
        ALTER TABLE public.goal 
        ADD CONSTRAINT goal_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Atualizar RLS policies para usar user_id em vez de id
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