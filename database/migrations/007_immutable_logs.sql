CREATE TABLE IF NOT EXISTS immutable_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  "index" BIGINT NOT NULL UNIQUE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  acao VARCHAR(100) NOT NULL,
  usuario_id UUID,
  dados JSONB,
  hash_anterior VARCHAR(64),
  hash VARCHAR(64) NOT NULL UNIQUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_immutable_logs_index ON immutable_audit_logs("index");
CREATE INDEX IF NOT EXISTS idx_immutable_logs_timestamp ON immutable_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_immutable_logs_usuario ON immutable_audit_logs(usuario_id);
