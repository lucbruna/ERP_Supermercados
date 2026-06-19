#!/bin/bash
set -e

REPLICATION_USER="${REPLICATION_USER:-replicator}"
REPLICATION_PASSWORD="${REPLICATION_PASSWORD:-replicator_secret}"
PRIMARY_HOST="${PRIMARY_HOST:-postgres}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
PRIMARY_USER="${PRIMARY_USER:-admin}"
PRIMARY_PASSWORD="${PRIMARY_PASSWORD:-supersecret}"
POSTGRES_DB="${POSTGRES_DB:-crm_supermercado}"

echo "Waiting for primary to be ready..."
until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$PRIMARY_USER"; do
  echo "Primary not ready, retrying in 2s..."
  sleep 2
done

echo "Setting up streaming replication from primary..."

export PGPASSWORD="$PRIMARY_PASSWORD"

REPLICATOR_EXISTS=$(psql -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$PRIMARY_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$REPLICATION_USER'")

if [ "$REPLICATOR_EXISTS" != "1" ]; then
  echo "Creating replication user..."
  psql -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$PRIMARY_USER" -d "$POSTGRES_DB" -c "CREATE ROLE $REPLICATION_USER WITH REPLICATION LOGIN PASSWORD '$REPLICATION_PASSWORD';"
fi

echo "Taking base backup from primary..."
pg_basebackup -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$REPLICATION_USER" -D /var/lib/postgresql/data -Fp -Xs -R -P -v

echo "Configuring standby..."
cat >> /var/lib/postgresql/data/postgresql.conf << EOF
primary_conninfo = 'host=$PRIMARY_HOST port=$PRIMARY_PORT user=$REPLICATION_USER password=$REPLICATION_PASSWORD application_name=replica'
primary_slot_name = 'replica_slot'
hot_standby = on
wal_level = replica
max_wal_senders = 5
wal_keep_size = 256
EOF

echo "Creating replication slot on primary..."
psql -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$PRIMARY_USER" -d "$POSTGRES_DB" -c "SELECT pg_create_physical_replication_slot('replica_slot') WHERE NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_slot');"

echo "Configuring pg_hba.conf for replication..."
cat >> /var/lib/postgresql/data/pg_hba.conf << EOF
# Replication connections
host replication $REPLICATION_USER 0.0.0.0/0 scram-sha-256
EOF

echo "Replica initialization complete. Starting PostgreSQL in standby mode..."
