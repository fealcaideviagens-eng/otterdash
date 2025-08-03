-- Update existing opcoes table to add missing columns and constraints
ALTER TABLE public.opcoes 
  ALTER COLUMN premio TYPE DECIMAL(10,2),
  ALTER COLUMN cotacao TYPE DECIMAL(10,2),
  ALTER COLUMN quantidade TYPE INTEGER,
  ALTER COLUMN strike TYPE DECIMAL(10,2);

-- Ensure status column has proper default
ALTER TABLE public.opcoes 
  ALTER COLUMN status TYPE TEXT,
  ALTER COLUMN status SET DEFAULT 'aberta';

-- Create venda table for tracking option closures
CREATE TABLE IF NOT EXISTS public.venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opcao_id TEXT NOT NULL,
  premio DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  quantidade INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda ENABLE ROW LEVEL SECURITY;

-- Create policies for opcoes table (allow all operations for now)
CREATE POLICY "Allow all operations on opcoes" ON public.opcoes FOR ALL USING (true);

-- Create policies for venda table (allow all operations for now)
CREATE POLICY "Allow all operations on venda" ON public.venda FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_opcoes_status ON public.opcoes(status);
CREATE INDEX IF NOT EXISTS idx_venda_opcao_id ON public.venda(opcao_id);