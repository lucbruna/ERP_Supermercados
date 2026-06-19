#!/bin/bash
set -e

CRM_DIR="/opt/crm-supermercado"

echo "============================================"
echo "  Removendo CRM Supermercado"
echo "============================================"

# Stop services
systemctl stop crm-supermercado 2>/dev/null || true
docker compose -f "$CRM_DIR/docker-compose.yml" down -v 2>/dev/null || true

# Remove systemd service
systemctl disable crm-supermercado 2>/dev/null || true
rm -f /etc/systemd/system/crm-supermercado.service
systemctl daemon-reload

# Remove cron
rm -f /etc/cron.d/crm-backup

# Remove nginx config
rm -f /etc/nginx/sites-enabled/crm-supermercado.conf
rm -f /etc/nginx/sites-available/crm-supermercado.conf
systemctl reload nginx 2>/dev/null || true

# Remove user and directory
userdel -r crm 2>/dev/null || true
rm -rf "$CRM_DIR"

echo "[OK] CRM Supermercado removido com sucesso."
