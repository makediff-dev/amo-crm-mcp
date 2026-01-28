#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sdkPackagePath = path.join(__dirname, '../node_modules/@modelcontextprotocol/sdk/package.json');
const packageJson = JSON.parse(fs.readFileSync(sdkPackagePath, 'utf8'));

// Add missing exports
if (!packageJson.exports['./server/mcp']) {
  packageJson.exports['./server/mcp'] = {
    import: './dist/esm/server/mcp.js',
    require: './dist/cjs/server/mcp.js'
  };
}

if (!packageJson.exports['./server/stdio']) {
  packageJson.exports['./server/stdio'] = {
    import: './dist/esm/server/stdio.js',
    require: './dist/cjs/server/stdio.js'
  };
}

if (!packageJson.exports['./server/zod-compat']) {
  packageJson.exports['./server/zod-compat'] = {
    import: './dist/esm/server/zod-compat.js',
    require: './dist/cjs/server/zod-compat.js'
  };
}

// Write back
fs.writeFileSync(sdkPackagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ Fixed @modelcontextprotocol/sdk exports');
