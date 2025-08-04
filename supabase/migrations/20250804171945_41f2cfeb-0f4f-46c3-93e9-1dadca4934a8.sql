-- Limpeza completa do banco de dados e correção de segurança

-- 1. LIMPAR TODAS AS TABELAS
TRUNCATE TABLE public.ops_completed CASCADE;
TRUNCATE TABLE public.ops_registry CASCADE;
TRUNCATE TABLE public.goal CASCADE;
TRUNCATE TABLE public.client CASCADE;

-- 2. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.client ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_completed ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR RELACIONAMENTOS CORRETOS ENTRE TABELAS
-- Adicionar coluna user_id em ops_registry se não existir
ALTER TABLE public.ops_registry 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna user_id em ops_completed se não existir
ALTER TABLE public.ops_completed 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna user_id em goal se não existir (goal_id já existe mas vamos padronizar)
ALTER TABLE public.goal 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fazer com que client.id seja uma referência para auth.users
ALTER TABLE public.client 
DROP CONSTRAINT IF EXISTS client_id_fkey;
ALTER TABLE public.client 
ADD CONSTRAINT client_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. CRIAR POLÍTICAS RLS PARA TODAS AS TABELAS

-- Políticas para client (perfil do usuário)
CREATE POLICY "Users can view their own profile" 
ON public.client 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.client 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.client 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas para ops_registry (opções)
CREATE POLICY "Users can view their own options" 
ON public.ops_registry 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own options" 
ON public.ops_registry 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own options" 
ON public.ops_registry 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own options" 
ON public.ops_registry 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para ops_completed (opções finalizadas)
CREATE POLICY "Users can view their own completed operations" 
ON public.ops_completed 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completed operations" 
ON public.ops_completed 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completed operations" 
ON public.ops_completed 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completed operations" 
ON public.ops_completed 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para goal (metas)
CREATE POLICY "Users can view their own goals" 
ON public.goal 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid()::text = goal_id::text);

CREATE POLICY "Users can create their own goals" 
ON public.goal 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid()::text = goal_id::text);

CREATE POLICY "Users can update their own goals" 
ON public.goal 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid()::text = goal_id::text);

CREATE POLICY "Users can delete their own goals" 
ON public.goal 
FOR DELETE 
USING (auth.uid() = user_id OR auth.uid()::text = goal_id::text);

-- 5. CORRIGIR A FUNÇÃO handle_new_user COM SEARCH PATH SEGURO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.client (id, nome, email, criado_em)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 6. CRIAR TRIGGER PARA NOVOS USUÁRIOS SE NÃO EXISTIR
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_ops_registry_user_id ON public.ops_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_ops_completed_user_id ON public.ops_completed(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_user_id ON public.goal(user_id);

-- 8. ADICIONAR RELACIONAMENTO ENTRE ops_completed e ops_registry
ALTER TABLE public.ops_completed
ADD CONSTRAINT fk_ops_completed_ops_registry 
FOREIGN KEY (ops_id) REFERENCES public.ops_registry(ops_id) ON DELETE SET NULL;