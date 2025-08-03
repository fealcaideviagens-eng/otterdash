-- Corrigir o tipo da senha para número
UPDATE cadastro SET senha = 123 WHERE nome = 'teste';

-- Verificar novamente
SELECT nome, senha, pg_typeof(senha) as tipo_senha FROM cadastro;