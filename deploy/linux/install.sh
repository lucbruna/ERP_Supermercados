#!/bin/bash
set -e

CRM_VERSION="1.0.0"
CRM_DIR="/opt/crm-supermercado"
CRM_USER="crm"
CRM_GROUP="crm"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error() { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

echo "============================================"
echo "  CRM Supermercado v${CRM_VERSION}"
echo "  Instalador Linux"
echo "============================================"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  error "Execute como root: sudo bash install.sh"
fi

# Detect distro
if [ -f /etc/os-release ]; then
  . /etc/os-release
  DISTRO="$ID"
else
  DISTRO="unknown"
fi
info "Distribuicao detectada: $DISTRO"

# ==================== PREREQUISITES ====================
echo ""
echo "--- Verificando Pré-requisitos ---"

check_docker() {
  if command -v docker &>/dev/null; then
    log "Docker encontrado"
    return 0
  fi
  warn "Docker não encontrado. Instalando..."
  case "$DISTRO" in
    ubuntu|debian)
      apt-get update -qq
      apt-get install -y -qq ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
      apt-get update -qq && apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
      systemctl enable --now docker
      ;;
    centos|rhel|fedora)
      yum install -y yum-utils
      yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
      yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
      systemctl enable --now docker
      ;;
    *)
      error "Distribuição não suportada para instalação automática do Docker. Instale manualmente."
      ;;
  esac
  log "Docker instalado com sucesso"
}

check_git() {
  if command -v git &>/dev/null; then
    log "Git encontrado"
    return 0
  fi
  warn "Git não encontrado. Instalando..."
  case "$DISTRO" in
    ubuntu|debian) apt-get install -y -qq git ;;
    centos|rhel|fedora) yum install -y git ;;
  esac
  log "Git instalado"
}

check_prerequisites() {
  for cmd in curl wget; do
    if command -v $cmd &>/dev/null; then
      log "$cmd encontrado"
    else
      warn "Instalando $cmd..."
      case "$DISTRO" in
        ubuntu|debian) apt-get install -y -qq $cmd ;;
        centos|rhel|fedora) yum install -y $cmd ;;
      esac
    fi
  done
}

check_docker
check_git
check_prerequisites

# ==================== CREATE USER ====================
echo ""
echo "--- Criando usuário do sistema ---"

if id "$CRM_USER" &>/dev/null; then
  log "Usuário $CRM_USER já existe"
else
  useradd -r -m -d "$CRM_DIR" -s /bin/bash "$CRM_USER"
  usermod -aG docker "$CRM_USER"
  log "Usuário $CRM_USER criado"
fi

# ==================== INSTALL FILES ====================
echo ""
echo "--- Instalando arquivos ---"

mkdir -p "$CRM_DIR"/{data/{postgres,redis,minio},logs,backups}
cp -r "$(dirname "$0")/../../" "$CRM_DIR/source/"
cp "$(dirname "$0")/../../docker-compose.yml" "$CRM_DIR/"
cp "$(dirname "$0")/../../docker-compose.prod.yml" "$CRM_DIR/" 2>/dev/null || true
cp "$(dirname "$0")/../../.env.example" "$CRM_DIR/.env"

# Generate random passwords/secrets
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 16)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$CRM_DIR/.env"
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$CRM_DIR/.env"

chown -R "$CRM_USER:$CRM_GROUP" "$CRM_DIR"
log "Arquivos instalados em $CRM_DIR"

# ==================== SYSTEMD SERVICE ====================
echo ""
echo "--- Configurando serviço systemd ---"

cat > /etc/systemd/system/crm-supermercado.service << 'EOF'
[Unit]
Description=CRM Supermercado
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=crm
Group=crm
WorkingDirectory=/opt/crm-supermercado
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose restart
StandardOutput=journal
StandardError=journal
TimeoutStartSec=300
TimeoutStopSec=120

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
log "Serviço systemd criado"

# ==================== CRON BACKUP ====================
echo ""
echo "--- Configurando backup automático ---"

cat > /etc/cron.d/crm-backup << 'EOF'
0 3 * * * crm /usr/bin/docker exec crm-postgres pg_dump -U admin crm_supermercado > /opt/crm-supermercado/backups/crm-$(date +\%Y\%m\%d).sql 2>&1
0 4 * * 0 crm find /opt/crm-supermercado/backups/ -name "crm-*.sql" -mtime +30 -delete
EOF

log "Backup automático configurado (diário às 3h, retenção 30 dias)"

# ==================== NGINX (optional) ====================
echo ""
echo "--- Configurando Nginx (opcional) ---"

if command -v nginx &>/dev/null || [ "$INSTALL_NGINX" = "true" ]; then
  apt-get install -y -qq nginx 2>/dev/null || yum install -y nginx 2>/dev/null || true

  cat > /etc/nginx/sites-available/crm-supermercado.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /dashboard/ {
        proxy_pass http://localhost:3081/;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3021;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

  ln -sf /etc/nginx/sites-available/crm-supermercado.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  log "Nginx configurado"
fi

# ==================== FINAL ====================
echo ""
echo "============================================"
echo "  Instalação concluída!"
echo "============================================"
echo ""
echo "  Para iniciar o CRM:"
echo "    sudo systemctl start crm-supermercado"
echo "    sudo systemctl enable crm-supermercado"
echo ""
echo "  Acessar:"
echo "    Dashboard: http://$(curl -s ifconfig.me):3081"
echo "    PDV:       http://$(curl -s ifconfig.me):3080"
echo ""
echo "  Comandos úteis:"
echo "    sudo systemctl status crm-supermercado    # Status"
echo "    sudo systemctl stop crm-supermercado      # Parar"
echo "    sudo journalctl -u crm-supermercado -f    # Logs"
echo ""
echo "  Backup manual:"
echo "    sudo /opt/crm-supermercado/backup.sh"
echo ""
echo "============================================"
