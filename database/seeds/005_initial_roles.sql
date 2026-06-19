INSERT INTO roles (nome, descricao, permissoes, nivel) VALUES
  ('Super Administrador', 'Acesso total ao sistema', '["*"]', 100),
  ('Administrador', 'Acesso administrativo completo', '["admin.*", "relatorios.*", "configuracoes.*"]', 90),
  ('Gerente de Loja', 'Gestao completa da loja', '["vendas.*", "estoque.*", "rh.*", "financeiro.*", "relatorios.visualizar"]', 70),
  ('Supervisor PDV', 'Supervisao de frente de caixa', '["pdv.*", "vendas.visualizar", "relatorios.visualizar"]', 50),
  ('Operador de Caixa', 'Operacao do PDV', '["pdv.vender", "pdv.consultar"]', 30),
  ('Conferente de Estoque', 'Gestao de estoque', '["estoque.*", "produtos.visualizar"]', 30),
  ('Financeiro', 'Gestao financeira', '["financeiro.*", "relatorios.visualizar"]', 40),
  ('RH', 'Gestao de pessoas', '["rh.*", "relatorios.visualizar"]', 40),
  ('Vendedor', 'Vendas e CRM', '["crm.*", "vendas.criar", "relatorios.visualizar"]', 30),
  ('Auditor', 'Acesso somente leitura + auditoria', '["*.visualizar", "auditoria.*"]', 20)
ON CONFLICT DO NOTHING;
