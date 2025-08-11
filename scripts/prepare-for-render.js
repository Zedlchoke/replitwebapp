
#!/usr/bin/env node

/**
 * SCRIPT CHUẨN BỊ DEPLOY LÊN RENDER
 * Tự động cấu hình tất cả file cần thiết cho deployment
 */

const fs = require('fs');
const path = require('path');

function createRenderFiles() {
  console.log('🔄 Tạo files cấu hình cho Render...');

  // 1. Tạo start script cho production
  const startScript = `#!/bin/bash
echo "🚀 Starting Long Quan Business Management System..."
echo "📍 Environment: $NODE_ENV"
echo "🔗 Database URL configured: $(echo $DATABASE_URL | cut -c1-30)..."

# Run database migration first
echo "🔄 Running database migration..."
node migrate-production.js

# Start the application
echo "🌟 Starting server..."
npm start
`;

  fs.writeFileSync('start-render.sh', startScript);
  console.log('✅ Created start-render.sh');

  // 2. Cập nhật package.json cho Render
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.engines = {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  };
  packageJson.scripts = {
    ...packageJson.scripts,
    "render:build": "npm install && npm run build",
    "render:start": "chmod +x start-render.sh && ./start-render.sh"
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');

  // 3. Tạo render.yaml
  const renderConfig = `services:
  - type: web
    name: long-quan-business-management
    env: node
    plan: free
    buildCommand: npm run render:build
    startCommand: npm run render:start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: long-quan-db
          property: connectionString

databases:
  - name: long-quan-db
    databaseName: long_quan_business
    user: long_quan_user
    plan: free
`;

  fs.writeFileSync('render.yaml', renderConfig);
  console.log('✅ Created render.yaml');

  console.log('🎉 Files chuẩn bị xong! Bây giờ push lên GitHub...');
}

createRenderFiles();
