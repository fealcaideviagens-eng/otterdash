-- Corrigir políticas RLS para ops_registry
-- O campo 'id' é o link com o usuário da tabela client

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can insert their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can update their own ops_registry" ON public.ops_registry;
DROP POLICY IF EXISTS "Users can delete their own ops_registry" ON public.ops_registry;

-- Habilitar RLS na tabela ops_registry
ALTER TABLE public.ops_registry ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas usando o campo 'id' como referência ao usuário
CREATE POLICY "Users can view their own ops_registry" 
ON public.ops_registry 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own ops_registry" 
ON public.ops_registry 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own ops_registry" 
ON public.ops_registry 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can delete their own ops_registry" 
ON public.ops_registry 
FOR DELETE 
USING (id = auth.uid());

-- Corrigir políticas RLS para ops_completed também
-- Assumindo que ops_id é o link para ops_registry

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can insert their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can update their own ops_completed" ON public.ops_completed;
DROP POLICY IF EXISTS "Users can delete their own ops_completed" ON public.ops_completed;

-- Habilitar RLS na tabela ops_completed
ALTER TABLE public.ops_completed ENABLE ROW LEVEL SECURITY;

-- Criar políticas para ops_completed usando a relação com ops_registry
CREATE POLICY "Users can view their own ops_completed" 
ON public.ops_completed 
FOR SELECT 
USING (
  ops_id IN (
    SELECT ops_id FROM public.ops_registry WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own ops_completed" 
ON public.ops_completed 
FOR INSERT 
WITH CHECK (
  ops_id IN (
    SELECT ops_id FROM public.ops_registry WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their own ops_completed" 
ON public.ops_completed 
FOR UPDATE 
USING (
  ops_id IN (
    SELECT ops_id FROM public.ops_registry WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own ops_completed" 
ON public.ops_completed 
FOR DELETE 
USING (
  ops_id IN (
    SELECT ops_id FROM public.ops_registry WHERE id = auth.uid()
  )
);