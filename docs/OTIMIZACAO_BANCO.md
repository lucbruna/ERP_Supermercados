# Otimização de Banco de Dados — CRM Supermercado

## Índices

### Estratégia de Indexação

- Crie índices compostos para consultas frequentes com múltiplos filtros.
- Prefira índices que cobrem as colunas de `WHERE`, `ORDER BY` e `JOIN`.
- Evite índices redundantes (colunas já cobertas por um índice composto à esquerda).
- Monitore índices não utilizados com `pg_stat_user_indexes`.

**Exemplos de índices compostos:**

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pedidos_cliente_data
  ON pedidos (cliente_id, data_pedido DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_itens_pedido_produto
  ON itens_pedido (pedido_id, produto_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_produtos_categoria_ativo
  ON produtos (categoria_id, ativo) WHERE ativo = true;
```

### Consultas comuns que precisam de índices

| Consulta | Índice sugerido |
|---|---|
| Buscar pedidos por cliente ordenado por data | `(cliente_id, data_pedido DESC)` |
| Buscar itens de um pedido | `(pedido_id, produto_id)` |
| Produtos ativos de uma categoria | `(categoria_id, ativo)` WHERE ativo = true |
| Buscar cliente por email | `(email)` UNIQUE |
| Relatório de vendas por período | `(data_pedido, status)` |

## Detecção do Problema N+1

### O que é
Ocorre quando uma consulta carrega N registros e, para cada um, executa outra consulta.

### Como detectar no Prisma

1. Habilite o query logging (ver `DATABASE_QUERY_LOG_SLOW`).
2. Ative o `event` de query no PrismaClient.
3. Use `Prisma.$on('query', ...)` para logar todas as queries.
4. Múltiplas queries idênticas com parâmetros diferentes em sequência indicam N+1.

### Como corrigir

```typescript
// RUIM — N+1
const pedidos = await prisma.pedido.findMany();
for (const pedido of pedidos) {
  const itens = await prisma.itemPedido.findMany({ where: { pedidoId: pedido.id } });
}

// BOM — usa include
const pedidos = await prisma.pedido.findMany({
  include: { itens: true },
});
```

## Uso do EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM pedidos
  WHERE cliente_id = 123
  ORDER BY data_pedido DESC
  LIMIT 20;
```

- Procure por `Seq Scan` em tabelas grandes (> 10k registros).
- `Index Scan` ou `Index Only Scan` é o ideal.
- O tempo real de execução está em `actual time=...`.
- O número de linhas estimado vs real mostra se o planner está errado.

## Configuração do Pool de Conexões

### PgBouncer

Configurado via `docker/pgbouncer/pgbouncer.ini`:

- **pool_mode = transaction**: cada transação pega uma conexão do pool.
- **default_pool_size = 25**: conexões por par (banco + usuário).
- **max_client_conn = 500**: clientes simultâneos aguardando conexão.
- **reserve_pool_size = 5**: conexões extras para picos.

### Fórmula para dimensionamento

```
Conexões recomendadas = (CPU_cores * 2) + (disk_bandwidth / 100)
```

Ou use a regra: `2 a 4 conexões por core` para PostgreSQL.

### Prisma + PgBouncer

No `datasource.url`, adicione `?pgbouncer=true` para que o Prisma use o modo de transação compatível com PgBouncer.

## Migrations

### Boas práticas

- Sempre execute `prisma migrate dev` em ambiente local.
- Use `prisma migrate deploy` em produção (não `prisma migrate dev`).
- Migrations devem ser revisadas em PR.
- Nunca edite migrations já aplicadas em produção.
- Prefira `CREATE INDEX CONCURRENTLY` para tabelas grandes.
- Teste migrations em staging antes de produção.

### Script seguro

```bash
# Produção
npx prisma migrate deploy

# Staging
npx prisma migrate reset --force
npx prisma migrate deploy
```

## Backup e Restore

### WAL Archiving (recovery point objective ~ minutos)

Configure no `postgresql.conf`:

```ini
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
archive_timeout = 60
```

### pg_dump (recovery point objective ~ horas)

```bash
# Backup completo
pg_dump -h postgres -U admin -d crm_supermercado -Fc -f /backups/crm_$(date +%Y%m%d_%H%M%S).dump

# Restore
pg_restore -h postgres -U admin -d crm_supermercado -Fc /backups/crm_*.dump
```

### Estratégia recomendada

| Tipo | Frequência | Retenção |
|---|---|---|
| WAL arquivado | Contínuo | 7 dias |
| pg_dump completo | Diário | 7 dias |
| pg_dump semanal | Semanal | 30 dias |
| pg_dump mensal | Mensal | 12 meses |

## Queries de Monitoramento de Performance

### Conexões ativas

```sql
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start DESC;
```

### Consultas lentas

```sql
SELECT query, calls, total_exec_time, mean_exec_time, rows, shared_blks_hit
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

### Índices não utilizados

```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexdef NOT LIKE '%UNIQUE%'
ORDER BY tablename;
```

### Bloqueios ativos

```sql
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_query,
       blocking_activity.query AS blocking_query
FROM pg_locks blocked_locks
JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database = blocked_locks.database
  AND blocking_locks.relation = blocked_locks.relation
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### Tamanho das tabelas

```sql
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Cache hit ratio

```sql
SELECT 'index hit rate' AS metric,
       (sum(idx_blks_hit)) / nullif(sum(idx_blks_hit + idx_blks_read), 0) AS ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT 'table hit rate' AS metric,
       sum(heap_blks_hit) / nullif(sum(heap_blks_hit + heap_blks_read), 0) AS ratio
FROM pg_statio_user_tables;
```

## Dicas Rápidas

- Limite o uso de `SELECT *` em produção — busque apenas as colunas necessárias.
- Use `batch`/`bulk` operations (`createMany`, `updateMany`) em vez de loops.
- Use `EXPLAIN (ANALYZE, BUFFERS)` para ver o impacto no cache.
- Em relatórios pesados, considere materialized views.
- Configure `statement_timeout` no PostgreSQL para matar queries lentas automaticamente.
- Separe leituras de relatórios para o read replica.
