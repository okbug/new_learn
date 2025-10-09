# File Reader MCP 使用示例

## 🚀 快速开始

### 1. 启动 MCP 服务器

```bash
# 进入项目目录
cd ai_playground/file-reader-mcp

# 启动服务器
npm start
```

服务器启动后会显示：`File Reader MCP 服务器已启动`

### 2. 与 MCP 服务器交互

MCP 服务器通过标准输入输出 (stdio) 进行通信，使用 JSON-RPC 协议。

#### 获取可用工具列表

发送请求：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

服务器响应：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "读取指定文件的内容",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "要读取的文件路径（绝对路径或相对路径）"
            },
            "encoding": {
              "type": "string",
              "description": "文件编码格式（默认为 utf8）",
              "default": "utf8",
              "enum": ["utf8", "ascii", "base64", "hex", "binary"]
            }
          },
          "required": ["path"]
        }
      },
      {
        "name": "read_file_lines",
        "description": "读取文件的指定行范围",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "要读取的文件路径"
            },
            "start_line": {
              "type": "number",
              "description": "起始行号（从1开始）",
              "minimum": 1
            },
            "end_line": {
              "type": "number",
              "description": "结束行号（包含该行）",
              "minimum": 1
            },
            "encoding": {
              "type": "string",
              "description": "文件编码格式（默认为 utf8）",
              "default": "utf8"
            }
          },
          "required": ["path", "start_line", "end_line"]
        }
      },
      {
        "name": "get_file_info",
        "description": "获取文件的基本信息（大小、修改时间等）",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "要查询的文件路径"
            }
          },
          "required": ["path"]
        }
      }
    ]
  }
}
```

#### 读取文件内容

发送请求：
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "./example.txt",
      "encoding": "utf8"
    }
  }
}
```

服务器响应：
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "文件路径: ./example.txt\n文件大小: 123 字节\n编码格式: utf8\n\n文件内容:\n这是一个示例文件，用于测试 File Reader MCP 的功能。\n\n第二行内容\n第三行内容\n..."
      }
    ]
  }
}
```

#### 按行范围读取

发送请求：
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "read_file_lines",
    "arguments": {
      "path": "./example.txt",
      "start_line": 1,
      "end_line": 5
    }
  }
}
```

#### 获取文件信息

发送请求：
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_file_info",
    "arguments": {
      "path": "./example.txt"
    }
  }
}
```

## 🔧 在 AI 应用中使用

### 与 Claude Desktop 集成

1. 在 Claude Desktop 的配置文件中添加 MCP 服务器：

```json
{
  "mcpServers": {
    "file-reader": {
      "command": "node",
      "args": ["/path/to/file-reader-mcp/index.js"],
      "cwd": "/path/to/file-reader-mcp"
    }
  }
}
```

2. 重启 Claude Desktop，服务器会自动连接

3. 在对话中，Claude 可以使用以下工具：
   - `read_file` - 读取文件内容
   - `read_file_lines` - 按行范围读取
   - `get_file_info` - 获取文件信息

### 编程方式使用

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// 创建客户端
const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, {
  capabilities: {}
});

// 连接到服务器
const transport = new StdioClientTransport({
  command: 'node',
  args: ['index.js'],
  cwd: '/path/to/file-reader-mcp'
});

await client.connect(transport);

// 调用工具
const result = await client.callTool({
  name: 'read_file',
  arguments: {
    path: './example.txt'
  }
});

console.log(result.content[0].text);
```

## 🛡️ 安全注意事项

1. **路径限制**：服务器会阻止 `../` 路径遍历攻击
2. **权限检查**：自动处理文件访问权限
3. **错误处理**：提供详细的错误信息
4. **类型验证**：确保操作的是文件而不是目录

## 🔍 故障排除

### 常见错误

1. **文件不存在**：`ENOENT: no such file or directory`
2. **权限不足**：`EACCES: permission denied`
3. **路径是目录**：`EISDIR: illegal operation on a directory`
4. **路径遍历**：`不允许访问上级目录`

### 调试技巧

1. 检查文件路径是否正确
2. 确认文件权限
3. 使用绝对路径避免相对路径问题
4. 查看服务器错误日志