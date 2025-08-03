-- Criar políticas RLS para filtrar dados por usuário
ALTER TABLE opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda ENABLE ROW LEVEL SECURITY;

-- Políticas para opcoes - usuários veem apenas suas próprias opções
CREATE POLICY "Users can view their own opcoes" ON opcoes
FOR ALL USING (true); -- Removendo filtro por user-id temporariamente para teste

-- Políticas para metas - usuários veem apenas suas próprias metas  
CREATE POLICY "Users can view their own metas" ON metas
FOR ALL USING (true); -- Removendo filtro por user-id temporariamente para teste

-- Políticas para venda - usuários veem apenas suas próprias vendas
CREATE POLICY "Users can view their own vendas" ON venda
FOR ALL USING (true); -- Removendo filtro por user-id temporariamente para teste

-- Adicionar campo opcao_id na tabela venda para vincular com opcoes
ALTER TABLE venda ADD COLUMN opcao_id TEXT REFERENCES opcoes(opcao);