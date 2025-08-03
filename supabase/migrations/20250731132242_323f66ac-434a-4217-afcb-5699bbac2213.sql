-- Deletar e recriar o usuário de teste para garantir que esteja correto
DELETE FROM cadastro WHERE nome = 'teste';
INSERT INTO cadastro (nome, senha) VALUES ('teste', 123);