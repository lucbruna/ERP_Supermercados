module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'packages/backend/api-gateway/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'auth-service',
      script: 'packages/backend/auth-service/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3001 }
    },
    {
      name: 'security-service',
      script: 'packages/backend/security-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3002 }
    },
    {
      name: 'product-service',
      script: 'packages/backend/product-service/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3003 }
    },
    {
      name: 'sales-service',
      script: 'packages/backend/sales-service/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3004 }
    },
    {
      name: 'inventory-service',
      script: 'packages/backend/inventory-service/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3005 }
    },
    {
      name: 'financial-service',
      script: 'packages/backend/financial-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3006 }
    },
    {
      name: 'hr-service',
      script: 'packages/backend/hr-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3007 }
    },
    {
      name: 'report-service',
      script: 'packages/backend/report-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3008 }
    },
    {
      name: 'notification-service',
      script: 'packages/backend/notification-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3009 }
    },
    {
      name: 'crm-service',
      script: 'packages/backend/crm-service/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3010 }
    },
    {
      name: 'web-app',
      script: 'packages/frontend/web-app/dist/server/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3080 }
    },
    {
      name: 'storage-service',
      script: 'packages/backend/storage-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3022 }
    }
  ]
};
