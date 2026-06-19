# PLANO DE IMPLEMENTAÇÃO - CRM SUPERMERCADO ERP

## Estado Atual (v1.0)

### Backend: 18 microsserviços NestJS (+80% código presente)
### Frontend: 2 apps Next.js (web-app + dashboard)
### Mobile: 2 apps Flutter (employee + client)

---

## PRIORIDADE 1 - MÓDULOS CORE (Completar Imediatamente)

### 1. Tabela de Preços
**Backend**: ✅ pdv-service já possui `TabelaPreco` + `ItemTabelaPreco` com tipos PADRAO/PROMOCIONAL/CLIENTE/QUANTIDADE/ATACADO
**Frontend**: ✅ web-app já possui página `/precos` com CRUD funcional
**Pendente**: 
- Adicionar preço por cliente específico (já no schema)
- Adicionar regras de promoção (compre X leve Y, desconto progressivo)
- Adicionar validade por período (já no schema)
- Integrar frontend com backend real

### 2. Compras
**Backend**: ✅ purchasing-service completo (fornecedores, cotações, pedidos, recebimento, contratos, avaliações)
**Frontend**: ✅ web-app `/compras` com API integrada (pedidos, cotações, fornecedores, ranking)
**Pendente**:
- Cotação automática (selecionar melhor preço entre fornecedores)
- Notificação a fornecedores por email
- Curva ABC integrada com inventory-service

### 3. Estoque
**Backend**: ✅ inventory-service completo (produtos, lotes, inventário, transferências, curva ABC)
**Frontend**: ✅ web-app `/estoque` com API integrada
**Pendente**:
- Inventário rotativo com contagem cega
- Alerta de validade próxima
- Etiquetas de preço e gôndola

### 4. PDV
**Backend**: ✅ pdv-service completo (PDV, vendas, pagamentos, trocas, mesas, delivery, sangria, tabelas-preço)
**Frontend**: ✅ web-app `/pdv-avancado` com mesas e delivery
**Pendente**:
- Integração NFC-e/SAT real com SEFAZ
- Integração TEF com maquininhas
- Interface de caixa touch
- Balança digital (Toledo, Filizola, Líder)
- Offline mode

### 5. Fiscal
**Backend**: ✅ fiscal-service com estrutura (CFOP, NF-e, NFC-e, SPED)
**Frontend**: ✅ web-app `/fiscal` com API integrada
**Pendente**:
- Integração SEFAZ para autorização de NF-e/NFC-e
- Assinatura XML com certificado digital A1/A3
- Geração DANFE/DANFCe
- SPED PIS/COFINS/ICMS completo
- Contingência

### 6. CRM
**Backend**: ✅ crm-service completo (clientes, fidelidade, cupons, cashback, pontos, crédito, cobrança)
**Frontend**: ✅ web-app `/crm` com API integrada
**Pendente**:
- Integração com PDV para acúmulo automático de pontos
- Campanhas de marketing integradas

### 7. Relatórios
**Backend**: ✅ bi-service com estrutura (KPIs, relatórios, dashboards, indicadores)
**Frontend**: ✅ web-app `/relatorios` com API integrada
**Pendente**:
- DRE (Demonstração do Resultado)
- Fluxo de caixa projetado
- Margem por produto
- Exportação PDF/Excel

### 8. Dashboard
**Frontend**: ✅ web-app `/dashboard` com KPIs
**Frontend**: ⚠️ dashboard executivo com 7 placeholders vazios
**Pendente**:
- Criar 7 páginas departamentais no dashboard
- Conectar KPIs reais do backend
- Giro de estoque, ticket médio, margem real

### 9. API Integrações
**Backend**: ✅ integration-api com estrutura (e-commerce, balança, coletor)
**Frontend**: ✅ web-app `/integracoes` com API integrada
**Pendente**:
- Conectores reais Shopify/Magento/WooCommerce
- Protocolo serial para balanças
- SDK para coletores

### 10. Multi-empresa
**Backend**: ✅ auth-service com Company + Unidade
**Frontend**: ✅ web-app `/empresas` com API integrada + seletor no Header
**Pendente**:
- Isolamento completo por companyId em todos os serviços
- Dashboard multi-loja

---

## PRIORIDADE 2 - MÓDULOS COMPLEMENTARES

### 11. Convênios e Crediário
**Backend**: ⚠️ Estrutura parcial no pdv-service e crm-service
**Frontend**: ❌ Não possui página dedicada
**Criar**:
- Cadastro de convênios (empresas parceiras)
- Controle de limites por convênio
- Vendas faturadas para convênio
- Recebimento e baixa de faturas

### 12. RH Brasil (FGTS, INSS, IRRF, eSocial)
**Backend**: ✅ rh-service com estrutura (funcionários, ponto, folha, férias, recrutamento, treinamento)
**Frontend**: ✅ web-app `/dashboard/rh` com CRUD
**Pendente**:
- Cálculo real de INSS (tabela progressiva)
- Cálculo real de IRRF (tabela progressiva)
- FGTS (8% + rescisório)
- eSocial (todos os eventos S-1xxx)
- Ponto eletrônico com validação

### 13. Base Brasil
**Backend**: ❌ Não existe serviço dedicado
**Criar** em `packages/backend/base-brasil`:
- CNPJ, CPF com validação de dígitos
- IBGE (cidades, estados)
- NCM, CEST
- CFOP completo (entrada/saída)
- CNAE
- CEP com busca automática

### 14. Código de Barras
**Backend**: ✅ Estrutura no inventory-service (produtos com códigoBarras)
**Frontend**: ⚠️ Parcial
**Pendente**:
- Geração de etiquetas EAN-13
- Leitura via coletor
- Validação de dígito verificador

### 15. Contratos de Funcionários
**Backend**: ✅ rh-service
**Pendente**:
- Múltiplos contratos por funcionário
- Tipos de contrato (CLT, PJ, temporário)
- Alertas de vencimento
- Histórico de alterações

### 16. Gestão de Habilidades
**Backend**: ⚠️ rh-service sem módulo específico
**Criar**:
- Skill matrix por funcionário
- Níveis de proficiência
- Gap analysis
- Planos de desenvolvimento

### 17. Frota
**Backend**: ❌ Não existe
**Criar** em `packages/backend/fleet-service`:
- Veículos (marca, modelo, placa, renavam)
- Contratos (seguro, leasing)
- Abastecimentos
- Manutenções
- Custos por km
- Multas

---

## PRIORIDADE 3 - CORREÇÕES CRÍTICAS

### Mobile - Employee App
- ❌ Classe `AnimatedBuilder` duplicada (compila)
- ❌ Reconhecimento facial simulado (random)
- ❌ Geolocalização declarada mas não implementada
- ❌ Biometria não implementada

### Mobile - Client App
- ❌ Parser JSON manual quebrado (`_decodeJson`)
- ❌ Classe `ProductModel` duplicada (compila)
- ❌ Dark mode sem tema escuro

### Frontend Web
- ❌ Dashboard raiz `/` dá 404
- ❌ 7 páginas departamentais do dashboard são placeholders
- ❌ Formulários CRUD em `dashboard/*` não salvam (decorativos)
- ❌ Sem guardas de rota (qualquer página acessível sem login)

### Backend
- ❌ monitoring-service é stub (só health check)
- ❌ ai-service tem modelos simplistas
- ❌ Canais de marketing/notification são MOCK
- ❌ Nenhuma integração SEFAZ real
- ❌ Nenhum teste unitário/integração

### Infraestrutura
- ❌ Sem Dockerfiles para serviços
- ❌ Secrets Kubernetes com senhas fracas
- ❌ Sem CI/CD
- ❌ Sem monitoramento real

---

## PLANO DE AÇÃO - IMPLEMENTAÇÃO

### Fase 1 - Correções Críticas (1-2 dias)
1. Corrigir bugs de compilação mobile
2. Criar página raiz do dashboard
3. Adicionar guardas de rota no web-app
4. Completar monitoring-service

### Fase 2 - Completar Frontend (2-3 dias)
1. Implementar 7 páginas departamentais do dashboard
2. Conectar formulários CRUD do web-app dashboard/* à API
3. Adicionar loading states e error boundaries

### Fase 3 - Integrações Reais (3-5 dias)
1. Implementar canais reais de notificação (Email/SMS/WhatsApp)
2. Implementar AI service com modelos reais
3. Implementar cálculo fiscal (INSS, IRRF, FGTS)

### Fase 4 - Novos Módulos (3-5 dias)
1. Módulo Convênios
2. Módulo Frota
3. Módulo Base Brasil
4. Módulo Habilidades

### Fase 5 - Qualidade (2-3 dias)
1. Testes unitários e integração
2. Dockerfiles
3. CI/CD pipeline
4. Documentação

---

---

## OpenTelemetry Distributed Tracing

### Overview
All backend services are instrumented with OpenTelemetry for distributed tracing. Traces are exported to Jaeger for visualization and analysis.

### Architecture
- **Shared package**: `packages/shared/tracing/` (`@crm/tracing`)
- **Exporter**: Jaeger (HTTP endpoint on port 14268)
- **Auto-instrumentations**: HTTP, Express, NestJS Core, @prisma/client, ioredis, gRPC
- **Trace propagation**: W3C Trace Context (traceparent header)

### Viewing Traces
- **Local Docker**: Open Jaeger UI at [http://localhost:16686](http://localhost:16686)
- **Kubernetes**: Port-forward the Jaeger service: `kubectl port-forward -n crm-monitoring svc/jaeger 16686:16686`
- **Select service** from the dropdown menu and click "Find Traces"

### Adding Custom Spans in Services
```typescript
import { getTracer, startSpan, addEvent, recordException } from '@crm/tracing';

// In a service method:
const span = startSpan('my-custom-operation', {
  attributes: { 'my.attribute': 'value' },
});
try {
  // ... your business logic
  addEvent(span, 'processing-completed', { items: count });
} catch (err) {
  recordException(span, err);
  throw err;
} finally {
  span.end();
}

// Or using the singleton tracer:
const tracer = getTracer('my-service');
const span = tracer.startSpan('operation-name');
```

### Available Auto-Instrumentations
The following libraries are automatically instrumented (no code changes needed):
- **HTTP/HTTPS**: Incoming and outgoing HTTP requests
- **Express**: Request routing and middleware
- **NestJS Core**: Controller method execution
- **@prisma/client**: Database queries
- **ioredis**: Redis commands
- **gRPC**: Client and server calls

### Configuration
| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `JAEGER_HOST` | `localhost` | Jaeger collector hostname |
| `NODE_ENV` | - | Set to `development` for verbose OTel logging |

### TracingInterceptor
A global NestJS interceptor automatically creates spans for all controller methods:
- Span name: `{ControllerName}.{handlerName}`
- Attributes: HTTP method, URL, status code
- Records exceptions as span events

---

## ESTIMATIVA TOTAL: ~15 dias de desenvolvimento
