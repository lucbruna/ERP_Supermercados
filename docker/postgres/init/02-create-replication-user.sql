-- Create replication user for streaming replication
-- Password should be changed in production
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicator_secret';

-- Grant necessary permissions (usually CONNECT is enough, replication is inherent)
GRANT CONNECT ON DATABASE crm_supermercado TO replicator;

-- Allow replication connections (pg_hba.conf also needs entries)
-- host replication replicator 0.0.0.0/0 scram-sha-256

-- Create a physical replication slot (will be used by the replica)
SELECT pg_create_physical_replication_slot('replica_slot')
WHERE NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_slot');
