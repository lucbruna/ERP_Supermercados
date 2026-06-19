# Instalacao do CRM Supermercado - Windows

## Requisitos
- Windows 10/11 64 bits
- 8GB RAM minimo (16GB recomendado)
- 20GB de espaco em disco
- Docker Desktop (instalado automaticamente se necessario)

## Instalacao
1. Execute `CRM_Supermercado_Setup_v1.0.0.exe`
2. Siga o assistente de instalacao
3. O CRM iniciara automaticamente apos a instalacao
4. Acesse http://localhost:3081 para o Dashboard

## Primeiros Passos
1. Crie uma conta de administrador
2. Configure sua empresa (CNPJ, razao social, etc.)
3. Cadastre filiais/unidades
4. Cadastre produtos, funcionarios e fornecedores
5. Abra o PDV em http://localhost:3080

## Backup
- Automatico: diario as 3h da manha (mantem 30 dias)
- Manual: execute `backup-crm.bat`

## Parando o Sistema
- Execute `stop-crm.bat` ou feche o terminal
