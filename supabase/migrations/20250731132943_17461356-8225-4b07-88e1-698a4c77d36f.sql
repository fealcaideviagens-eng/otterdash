-- Limpar completamente todas as tabelas
DELETE FROM venda;
DELETE FROM opcoes;
DELETE FROM metas;
DELETE FROM cadastro;

-- Recriar usuário de teste
INSERT INTO cadastro (nome, senha) VALUES ('teste', 123);

-- Verificar se foi criado
SELECT * FROM cadastro;