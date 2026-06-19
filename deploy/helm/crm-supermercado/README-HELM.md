# Deploy com Helm - CRM Supermercado

## Pré-requisitos
- Kubernetes 1.24+
- Helm 3.8+
- Cert-manager (para TLS automático via Let's Encrypt)
- NGINX Ingress Controller

## Instalação

### 1. Adicionar repositório
```bash
helm repo add crm-supermercado https://charts.crm-supermercado.com
helm repo update
```

### 2. Instalar o chart
```bash
helm install crm-supermercado crm-supermercado/crm-supermercado \
  --namespace crm-system \
  --create-namespace \
  --set postgresql.auth.password=minha-senha-forte \
  --set secrets.redisPassword=outra-senha-forte \
  --set secrets.jwtSecret=meu-jwt-secret-de-32-caracteres \
  --set global.environment=production
```

### 3. Verificar instalação
```bash
kubectl get pods -n crm-system
kubectl get ing -n crm-system
```

## Configuração

### Usando um arquivo values personalizado
Crie um arquivo `values-prod.yaml`:

```yaml
global:
  environment: production
  timezone: America/Sao_Paulo

postgresql:
  auth:
    password: minha-senha-segura
  primary:
    persistence:
      size: 100Gi

webApp:
  replicaCount: 3
  resources:
    requests:
      memory: 512Mi
      cpu: "0.5"

monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
```

```bash
helm upgrade crm-supermercado crm-supermercado/crm-supermercado \
  --namespace crm-system \
  -f values-prod.yaml
```

### Configuração de Domínio Personalizado
```yaml
ingress:
  hosts:
    - host: meu-crm.meu-dominio.com
      paths:
        - path: /api
          pathType: Prefix
          serviceName: api-gateway
          servicePort: 3000
        - path: /
          pathType: Prefix
          serviceName: web-app
          servicePort: 3080
        - path: /dashboard
          pathType: Prefix
          serviceName: dashboard
          servicePort: 3081
```

## Parâmetros

### Globais
| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `global.environment` | Ambiente de execução | `production` |
| `global.timezone` | Fuso horário | `America/Sao_Paulo` |
| `global.imageRegistry` | Registry das imagens | `ghcr.io/crm-supermercado` |

### Banco de Dados
| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `postgresql.enabled` | Habilitar PostgreSQL | `true` |
| `postgresql.auth.database` | Nome do banco | `crm_supermercado` |
| `postgresql.auth.username` | Usuário | `admin` |
| `postgresql.auth.password` | Senha | `changeme` |
| `postgresql.primary.persistence.size` | Tamanho do PV | `50Gi` |

### Serviços Backend
Cada serviço backend aceita os seguintes parâmetros (ex: `apiGateway.*`, `authService.*`):

| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `replicaCount` | Número de réplicas | `2` |
| `image` | Imagem Docker | `ghcr.io/crm-supermercado/{service}:latest` |
| `resources.requests.memory` | Memória solicitada | `256Mi` |
| `resources.requests.cpu` | CPU solicitada | `200m` |
| `hpa.enabled` | Auto-scaling | `true` |
| `pdb.enabled` | Pod Disruption Budget | `true` |

### Frontend
| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `webApp.replicaCount` | Réplicas do web-app | `2` |
| `webApp.image` | Imagem do web-app | `ghcr.io/crm-supermercado/web-app:latest` |
| `dashboard.replicaCount` | Réplicas do dashboard | `2` |
| `dashboard.image` | Imagem do dashboard | `ghcr.io/crm-supermercado/dashboard:latest` |

### Monitoramento
| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `monitoring.prometheus.enabled` | Habilitar Prometheus | `true` |
| `monitoring.grafana.enabled` | Habilitar Grafana | `true` |
| `monitoring.grafana.adminPassword` | Senha admin Grafana | `admin` |

## Comandos Úteis

### Upgrade
```bash
helm upgrade crm-supermercado crm-supermercado/crm-supermercado \
  --namespace crm-system \
  -f values-prod.yaml
```

### Rollback
```bash
helm rollback crm-supermercado 1 --namespace crm-system
```

### Uninstall
```bash
helm uninstall crm-supermercado --namespace crm-system
kubectl delete namespace crm-system
kubectl delete namespace crm-system-monitoring
```

### Visualizar valores
```bash
helm get values crm-supermercado --namespace crm-system
```

## Troubleshooting

### Pods não iniciam
```bash
kubectl describe pod <pod-name> -n crm-system
kubectl logs <pod-name> -n crm-system
```

### Problemas de DNS
```bash
kubectl run --rm -it dns-test --image=busybox -- nslookup postgres
```

### Problemas de TLS
```bash
kubectl describe certificate crm-tls -n crm-system
kubectl describe order -n crm-system
```

## Segurança

Recomendações para produção:
- Altere todas as senhas em `secrets.*`
- Use `global.imagePullSecrets` para registry privado
- Habilite `networkPolicy.enabled: true`
- Configure `serviceMonitor.enabled: true` para observabilidade
- Use um secret externo (Vault, AWS Secrets Manager) para gerenciamento de segredos
