# 📖 如何使用 File Reader MCP

## 🎯 三种主要使用方式

### 1. 🤖 与 Claude Desktop 集成（推荐）

这是最实用的方式，让 Claude 能够读取你的文件：

#### 步骤：
1. **找到 Claude Desktop 配置文件**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **添加 MCP 服务器配置**
   ```json
   {
     "mcpServers": {
       "file-reader": {
         "command": "node",
         "args": ["/Users/ajunge/Desktop/study/new_learn/ai_playground/file-reader-mcp/index.js"],
         "env": {}
       }
     }
   }
   ```

3. **重启 Claude Desktop**

4. **开始使用**
   - 在 Claude 中说："请读取我的 example.txt 文件"
   - Claude 就能自动调用你的 MCP 服务读取文件！

### 2. 🔧 编程方式使用

在你的 Node.js 项目中集成：

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, { capabilities: {} });

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./file-reader-mcp/index.js']
});

await client.connect(transport);

// 读取文件
const result = await client.callTool({
  name: 'read_file',
  arguments: { path: './my-file.txt' }
});

console.log(result.content[0].text);
```

### 3. 🖥️ 命令行直接使用

#### 启动服务器
```bash
cd ai_playground/file-reader-mcp
node index.js
```

#### 发送 JSON-RPC 请求
```bash
# 在另一个终端
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | nc localhost 3000
```

## 🛠️ 可用工具详解

### 1. read_file - 读取完整文件
```json
{
  "name": "read_file",
  "arguments": {
    "path": "./example.txt",
    "encoding": "utf8"
  }
}
```

**用途：**
- 读取配置文件
- 分析日志文件
- 处理文档内容

### 2. read_file_lines - 按行读取
```json
{
  "name": "read_file_lines",
  "arguments": {
    "path": "./large-file.txt",
    "start_line": 100,
    "end_line": 200
  }
}
```

**用途：**
- 处理大文件
- 查看特定行范围
- 分页读取内容

### 3. get_file_info - 获取文件信息
```json
{
  "name": "get_file_info",
  "arguments": {
    "path": "./document.pdf"
  }
}
```

**用途：**
- 检查文件大小
- 获取修改时间
- 验证文件存在

## 🎯 实际应用场景

### 场景 1: 代码审查助手
```
你: "请帮我审查这个 React 组件"
Claude: 使用 read_file 读取组件文件，然后提供代码审查建议
```

### 场景 2: 文档分析
```
你: "总结这个 README 文件的要点"
Claude: 使用 read_file 读取 README，然后提供摘要
```

### 场景 3: 日志分析
```
你: "分析最近 100 行日志"
Claude: 使用 read_file_lines 读取日志末尾，然后分析问题
```

### 场景 4: 配置文件管理
```
你: "检查我的配置文件是否正确"
Claude: 使用 read_file 读取配置，然后验证格式和内容
```

## 🔒 安全特性

- ✅ 路径规范化防止目录遍历攻击
- ✅ 文件存在性检查
- ✅ 详细的错误处理
- ✅ 编码格式支持

## 🚀 快速开始

1. **测试基本功能**
   ```bash
   node quick-demo.js
   ```

2. **运行完整演示**
   ```bash
   node working-demo.js
   ```

3. **交互式测试**
   ```bash
   node interactive-demo.js
   ```

## 💡 高级用法

### 批量文件处理
结合多个工具调用，可以实现：
- 批量读取多个文件
- 比较文件内容
- 生成文件报告

### 与其他 MCP 服务组合
- 文件读取 + 数据库查询
- 文件分析 + API 调用
- 内容处理 + 邮件发送

## 🎉 开始使用吧！

现在你已经了解了所有使用方式，选择最适合你需求的方法开始使用 MCP 吧！

最推荐的是与 Claude Desktop 集成，这样你就有了一个能够读取和分析你本地文件的 AI 助手！