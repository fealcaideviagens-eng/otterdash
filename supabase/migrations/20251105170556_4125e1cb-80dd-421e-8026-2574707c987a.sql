-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela de garantias
CREATE TABLE public.garantias (
  garantia_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('acao', 'renda_fixa')),
  
  -- Campos para ações
  ticker VARCHAR(10),
  quantidade NUMERIC,
  
  -- Campos para renda fixa
  tipo_renda_fixa VARCHAR(20) CHECK (tipo_renda_fixa IN ('tesouro_selic', 'caixa')),
  valor_reais NUMERIC CHECK (valor_reais >= 0),
  
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own garantias"
ON public.garantias
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own garantias"
ON public.garantias
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own garantias"
ON public.garantias
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own garantias"
ON public.garantias
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_garantias_updated_at
BEFORE UPDATE ON public.garantias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();