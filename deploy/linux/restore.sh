#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <arquivo-backup.tar.gz>"
  exit 1
fi

BACKUP_FILE="$1"
CRM_DIR="/opt/crm-supermercado"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERRO] Arquivo não encontrado: $BACKUP_FILE"
  exit 1
fi

echo "[CRM] Restaurando backup: $BACKUP_FILE"
tar -xzf "$BACKUP_FILE" -C /tmp/restore-crm/

# Restore .env
cp /tmp/restore-crm/.env "$CRM_DIR/.env"

# Restore database
docker exec -i crm-postgres psql -U admin crm_supermercado < /tmp/restore-crm/*.sql

rm -rf /tmp/restore-crm
echo "[OK] Backup restaurado com sucesso!"
echo "[INFO] Reinicie o CRM: systemctl restart crm-supermercado"
