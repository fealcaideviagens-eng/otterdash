-- Inserir usuário de teste na tabela cadastro
INSERT INTO cadastro (nome, senha) VALUES ('teste', 123) ON CONFLICT DO NOTHING;

-- Inserir algumas opções de exemplo vinculadas ao usuário teste
INSERT INTO opcoes (opcao, operacao, tipo, acao, strike, cotacao, quantidade, premio, data, status, "user-id") VALUES 
('ABEV3123', 'venda', 'call', 'ABEV3', 15.50, 14.80, 100, 0.85, '2024-08-15', 'aberta', (SELECT "user-id" FROM cadastro WHERE nome = 'teste')),
('PETR4234', 'venda', 'put', 'PETR4', 35.00, 36.20, 50, 1.20, '2024-08-10', 'aberta', (SELECT "user-id" FROM cadastro WHERE nome = 'teste')),
('VALE3345', 'compra', 'call', 'VALE3', 65.00, 63.50, 200, 2.10, '2024-07-25', 'encerrada', (SELECT "user-id" FROM cadastro WHERE nome = 'teste'))
ON CONFLICT (opcao) DO NOTHING;

-- Inserir uma venda de exemplo (para opção encerrada)
INSERT INTO venda (premio, encerramento, quantidade, opcao_id) VALUES 
(1.50, '2024-08-01', 200, 'VALE3345')
ON CONFLICT DO NOTHING;

-- Inserir uma meta de exemplo
INSERT INTO metas ("m-mensal", "m-anual", ano, "user-id") VALUES 
(5000.00, NULL, 2024, (SELECT "user-id" FROM cadastro WHERE nome = 'teste'))
ON CONFLICT DO NOTHING;