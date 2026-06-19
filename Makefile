.PHONY: help install dev build test lint docker-up docker-down migrate seed clean

help:
	@echo "CRM SUPERMERCADO - Comandos Disponiveis"
	@echo "========================================"
	@echo "make install     - Instalar dependencias de todos os modulos"
	@echo "make dev         - Iniciar todos os servicos em modo desenvolvimento"
	@echo "make build       - Compilar todos os modulos"
	@echo "make test        - Executar testes"
	@echo "make lint        - Verificar codigo com ESLint"
	@echo "make docker-up   - Iniciar containers Docker"
	@echo "make docker-down - Parar containers Docker"
	@echo "make migrate     - Executar migrations do Prisma"
	@echo "make seed        - Popular banco com dados iniciais"
	@echo "make clean       - Limpar arquivos de build"

install:
	npm install
	cd packages/backend/auth-service && npm install
	cd packages/backend/rh-service && npm install
	cd packages/backend/financial-service && npm install
	cd packages/backend/pdv-service && npm install
	cd packages/backend/inventory-service && npm install
	cd packages/backend/purchasing-service && npm install
	cd packages/backend/crm-service && npm install
	cd packages/backend/marketing-service && npm install
	cd packages/backend/security-service && npm install
	cd packages/backend/cftv-service && npm install
	cd packages/backend/distribution-service && npm install
	cd packages/backend/bi-service && npm install
	cd packages/backend/ai-service && npm install
	cd packages/backend/notification-service && npm install
	cd packages/backend/api-gateway && npm install
	cd packages/backend/fiscal-service && npm install
	cd packages/backend/integration-api && npm install
	cd packages/backend/base-brasil && npm install
	cd packages/backend/codigo-barras-service && npm install
	cd packages/backend/contratos-service && npm install
	cd packages/backend/convenio-service && npm install
	cd packages/backend/frota-service && npm install
	cd packages/backend/habilidades-service && npm install
	cd packages/backend/monitoring-service && npm install
	cd packages/frontend/web-app && npm install
	cd packages/frontend/dashboard && npm install

dev:
	docker-compose up -d postgres redis rabbitmq
	npm run dev

build:
	npm run build

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

migrate:
	cd packages/backend/auth-service && npx prisma migrate dev
	cd packages/backend/rh-service && npx prisma migrate dev
	cd packages/backend/financial-service && npx prisma migrate dev
	cd packages/backend/pdv-service && npx prisma migrate dev
	cd packages/backend/inventory-service && npx prisma migrate dev
	cd packages/backend/purchasing-service && npx prisma migrate dev
	cd packages/backend/crm-service && npx prisma migrate dev
	cd packages/backend/marketing-service && npx prisma migrate dev
	cd packages/backend/security-service && npx prisma migrate dev
	cd packages/backend/cftv-service && npx prisma migrate dev
	cd packages/backend/distribution-service && npx prisma migrate dev
	cd packages/backend/bi-service && npx prisma migrate dev
	cd packages/backend/ai-service && npx prisma migrate dev
	cd packages/backend/notification-service && npx prisma migrate dev
	cd packages/backend/fiscal-service && npx prisma migrate dev
	cd packages/backend/integration-api && npx prisma migrate dev
	cd packages/backend/base-brasil && npx prisma migrate dev
	cd packages/backend/codigo-barras-service && npx prisma migrate dev
	cd packages/backend/contratos-service && npx prisma migrate dev
	cd packages/backend/convenio-service && npx prisma migrate dev
	cd packages/backend/frota-service && npx prisma migrate dev
	cd packages/backend/habilidades-service && npx prisma migrate dev
	cd packages/backend/monitoring-service && npx prisma migrate dev

seed:
	cd packages/backend/auth-service && npx ts-node src/seeds/seed.ts

clean:
	rm -rf packages/backend/*/dist
	rm -rf packages/frontend/*/.next
	rm -rf packages/mobile/*/build
