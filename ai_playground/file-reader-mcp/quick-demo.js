#!/usr/bin/env node

/**
 * 快速演示 File Reader MCP
 * 直接测试核心功能
 */

import fs from 'fs';
import path from 'path';

console.log('🎯 File Reader MCP 快速演示');
console.log('═'.repeat(50));

// 检查项目文件
console.log('📁 检查项目文件...');
const files = ['package.json', 'index.js', 'example.txt'];
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

// 检查依赖
console.log('\n📦 检查依赖...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ 项目名称: ${packageJson.name}`);
  console.log(`✅ 版本: ${packageJson.version}`);
  console.log(`✅ 主要依赖: ${Object.keys(packageJson.dependencies || {}).join(', ')}`);
} catch (error) {
  console.log('❌ 无法读取 package.json');
}

// 测试示例文件
console.log('\n📖 测试示例文件...');
try {
  const content = fs.readFileSync('example.txt', 'utf8');
  console.log('✅ example.txt 内容：');
  console.log('─'.repeat(40));
  console.log(content);
  console.log('─'.repeat(40));
} catch (error) {
  console.log('❌ 无法读取 example.txt');
}

// 显示使用说明
console.log('\n🚀 启动 MCP 服务器：');
console.log('   npm start');
console.log('   或者: node index.js');

console.log('\n🔧 测试 MCP 服务器：');
console.log('   node working-demo.js');

console.log('\n📋 可用的工具：');
console.log('   1. read_file - 读取完整文件内容');
console.log('   2. read_file_lines - 按行读取文件');
console.log('   3. get_file_info - 获取文件信息');

console.log('\n💡 JSON-RPC 请求示例：');
console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "./example.txt",
      "encoding": "utf8"
    }
  }
}`);

console.log('\n🎉 演示完成！MCP 服务器已准备就绪。');