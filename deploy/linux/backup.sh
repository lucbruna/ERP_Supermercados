#!/bin/bash
CRM_DIR="/opt/crm-supermercado"
BACKUP_DIR="$CRM_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="crm-full-backup-$DATE.tar.gz"

echo "[CRM] Realizando backup completo..."
docker exec crm-postgres pg_dump -U admin crm_supermercado > /tmp/crm-db-$DATE.sql
tar -czf "$BACKUP_DIR/$FILENAME" \
  -C "$CRM_DIR" .env \
  -C /tmp crm-db-$DATE.sql \
  -C "$CRM_DIR/data" .
rm -f /tmp/crm-db-$DATE.sql
echo "[OK] Backup salvo em: $BACKUP_DIR/$FILENAME"
echo "[INFO] Tamanho: $(du -h $BACKUP_DIR/$FILENAME | cut -f1)"
