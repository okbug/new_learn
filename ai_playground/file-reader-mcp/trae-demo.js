#!/usr/bin/env node

/**
 * Trae AI MCP 简化演示脚本
 * 展示如何在 Trae AI 中使用 File Reader MCP
 */

console.log('🎯 在 Trae AI 中使用 File Reader MCP');
console.log('═'.repeat(50));

console.log('\n📋 配置步骤:');
console.log('1. 确保 MCP 服务器文件存在');
console.log('2. 在 Trae AI 中配置 MCP 服务器');
console.log('3. 开始使用对话式文件读取');

console.log('\n🔧 MCP 服务器配置:');
console.log('```json');
console.log(JSON.stringify({
  "mcpServers": {
    "file-reader": {
      "command": "node",
      "args": ["/Users/ajunge/Desktop/study/new_learn/ai_playground/file-reader-mcp/index.js"],
      "env": {}
    }
  }
}, null, 2));
console.log('```');

console.log('\n💬 在 Trae AI 中的使用示例:');

const examples = [
  {
    user: "请读取我的 package.json 文件",
    ai: "我来为你读取 package.json 文件...",
    action: "使用 read_file 工具读取文件内容"
  },
  {
    user: "分析 src/App.vue 文件的代码结构",
    ai: "我来分析这个 Vue 组件的结构...",
    action: "使用 read_file 读取文件，然后分析代码"
  },
  {
    user: "检查 tsconfig.json 配置是否正确",
    ai: "我来检查你的 TypeScript 配置...",
    action: "使用 read_file 读取配置文件并验证"
  },
  {
    user: "获取 README.md 文件的基本信息",
    ai: "我来获取文件的详细信息...",
    action: "使用 get_file_info 获取文件元数据"
  },
  {
    user: "读取日志文件的最后 20 行",
    ai: "我来读取日志文件的最新内容...",
    action: "使用 read_file_lines 按行读取"
  }
];

examples.forEach((example, index) => {
  console.log(`\n${index + 1}. 💬 用户: "${example.user}"`);
  console.log(`   🤖 Trae AI: "${example.ai}"`);
  console.log(`   ⚙️  执行: ${example.action}`);
});

console.log('\n🚀 快速开始:');
console.log('1. 启动 MCP 服务器:');
console.log('   cd ai_playground/file-reader-mcp');
console.log('   node index.js');

console.log('\n2. 在 Trae AI 中测试:');
console.log('   "请读取 example.txt 文件"');

console.log('\n3. 查看可用工具:');
console.log('   - read_file: 读取完整文件内容');
console.log('   - read_file_lines: 按行读取文件');
console.log('   - get_file_info: 获取文件信息');

console.log('\n🎯 实际应用场景:');
const scenarios = [
  '📝 代码审查: 让 AI 分析代码质量',
  '📊 配置检查: 验证配置文件正确性',
  '📖 文档生成: 基于代码生成文档',
  '🔍 日志分析: 分析错误日志找问题',
  '🏗️  项目分析: 理解项目结构',
  '🔧 重构建议: 获取代码改进建议'
];

scenarios.forEach(scenario => {
  console.log(`   ${scenario}`);
});

console.log('\n💡 提示:');
console.log('- MCP 服务器需要保持运行状态');
console.log('- 支持中文文件内容读取');
console.log('- 具有安全的路径检查机制');
console.log('- 可以处理各种文件格式');

console.log('\n🎉 你的 MCP 服务器已准备就绪！');
console.log('现在就可以在 Trae AI 中开始使用了！');