-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  permissoes JSONB DEFAULT '[]',
  nivel INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Cargos table
CREATE TABLE IF NOT EXISTS cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  salario_base DECIMAL(15,2),
  carga_horaria INTEGER,
  departamento_id UUID,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Departamentos table
CREATE TABLE IF NOT EXISTS departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(20),
  centro_custo VARCHAR(50),
  gerente_id UUID,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Escalas table
CREATE TABLE IF NOT EXISTS escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('FIXA', 'REVEZAMENTO', 'PLANTAO', 'LIVRE')),
  dias_trabalho INTEGER DEFAULT 6,
  dias_folga INTEGER DEFAULT 1,
  hora_entrada TIME,
  hora_saida TIME,
  tolerancia_minutos INTEGER DEFAULT 10,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Subcategorias table
CREATE TABLE IF NOT EXISTS subcategorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias_produto(id),
  codigo VARCHAR(20),
  margem_padrao DECIMAL(5,2),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Solicitacoes_compra table
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) UNIQUE NOT NULL,
  solicitante_id UUID NOT NULL,
  departamento_id UUID,
  data_solicitacao TIMESTAMP DEFAULT NOW(),
  data_necessidade DATE,
  prioridade VARCHAR(20) CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'COTADA', 'PEDIDO_GERADO')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Solicitacao_compra_itens table
CREATE TABLE IF NOT EXISTS solicitacao_compra_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_compra(id),
  produto_id UUID,
  descricao TEXT,
  quantidade DECIMAL(15,3),
  unidade VARCHAR(10),
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Orcamentos (sales quotes) table
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID,
  vendedor_id UUID,
  data_emissao TIMESTAMP DEFAULT NOW(),
  data_validade DATE,
  itens JSONB DEFAULT '[]',
  valor_total DECIMAL(15,2),
  desconto DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'APROVADO', 'REJEITADO', 'EXPIRADO', 'CONVERTIDO')),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- NFSe table (Nota Fiscal de Servicos)
CREATE TABLE IF NOT EXISTS nfses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) NOT NULL,
  serie VARCHAR(5),
  tipo VARCHAR(20) CHECK (tipo IN ('RPS', 'NFSe')),
  status VARCHAR(20) CHECK (status IN ('DIGITANDO', 'VALIDADA', 'TRANSMITIDA', 'AUTORIZADA', 'REJEITADA', 'CANCELADA')),
  rps_numero VARCHAR(20),
  rps_serie VARCHAR(5),
  rps_tipo VARCHAR(20),
  data_emissao TIMESTAMP,
  competencia DATE,
  prestador_cpf_cnpj VARCHAR(20),
  prestador_razao_social VARCHAR(200),
  tomador_cpf_cnpj VARCHAR(20),
  tomador_razao_social VARCHAR(200),
  valor_servicos DECIMAL(15,2),
  valor_deducoes DECIMAL(15,2) DEFAULT 0,
  valor_pis DECIMAL(15,2) DEFAULT 0,
  valor_cofins DECIMAL(15,2) DEFAULT 0,
  valor_inss DECIMAL(15,2) DEFAULT 0,
  valor_ir DECIMAL(15,2) DEFAULT 0,
  valor_csll DECIMAL(15,2) DEFAULT 0,
  valor_iss DECIMAL(15,2) DEFAULT 0,
  aliquota_iss DECIMAL(5,2),
  base_calculo DECIMAL(15,2),
  valor_liquido DECIMAL(15,2),
  xml_retorno TEXT,
  protocolo VARCHAR(50),
  codigo_verificacao VARCHAR(50),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Configuracoes_empresa table
CREATE TABLE IF NOT EXISTS configuracoes_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL UNIQUE,
  chave VARCHAR(100) NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_roles_nome ON roles(nome);
CREATE INDEX IF NOT EXISTS idx_cargos_departamento ON cargos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_status ON solicitacoes_compra(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_data ON solicitacoes_compra(data_solicitacao);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_nfses_status ON nfses(status);
CREATE INDEX IF NOT EXISTS idx_nfses_emissao ON nfses(data_emissao);
CREATE INDEX IF NOT EXISTS idx_configuracoes_empresa ON configuracoes_empresa(empresa_id, chave);
