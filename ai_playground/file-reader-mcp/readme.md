# File Reader MCP

一个基于 Node.js 实现的 Model Context Protocol (MCP) 服务器，用于读取文件内容。

## 功能特性

- 🔍 **读取完整文件内容** - 支持多种编码格式
- 📄 **按行范围读取** - 读取文件的指定行范围
- 📊 **获取文件信息** - 查看文件大小、修改时间等元数据
- 🔒 **安全验证** - 防止路径遍历攻击
- 🚀 **高性能** - 基于 Node.js 异步 I/O

## 安装

1. 确保已安装 Node.js 18+ 版本
2. 安装依赖：

```bash
npm install
```

## 使用方法

### 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 可用工具

#### 1. read_file - 读取文件内容

读取指定文件的完整内容。

**参数：**
- `path` (必需): 文件路径（绝对路径或相对路径）
- `encoding` (可选): 文件编码格式，默认为 'utf8'
  - 支持的编码：`utf8`, `ascii`, `base64`, `hex`, `binary`

**示例：**
```json
{
  "name": "read_file",
  "arguments": {
    "path": "./example.txt",
    "encoding": "utf8"
  }
}
```

#### 2. read_file_lines - 按行范围读取

读取文件的指定行范围内容。

**参数：**
- `path` (必需): 文件路径
- `start_line` (必需): 起始行号（从1开始）
- `end_line` (必需): 结束行号（包含该行）
- `encoding` (可选): 文件编码格式，默认为 'utf8'

**示例：**
```json
{
  "name": "read_file_lines",
  "arguments": {
    "path": "./example.txt",
    "start_line": 1,
    "end_line": 10
  }
}
```

#### 3. get_file_info - 获取文件信息

获取文件的基本信息和元数据。

**参数：**
- `path` (必需): 文件路径

**示例：**
```json
{
  "name": "get_file_info",
  "arguments": {
    "path": "./example.txt"
  }
}
```

## 安全特性

- **路径验证**: 防止 `../` 路径遍历攻击
- **权限检查**: 自动处理文件访问权限错误
- **类型验证**: 确保操作的是文件而不是目录
- **错误处理**: 详细的错误信息和状态码

## 错误处理

服务器会返回详细的错误信息：

- `ENOENT`: 文件不存在
- `EACCES`: 没有访问权限
- `EISDIR`: 路径是目录而不是文件
- `InvalidParams`: 参数验证失败
- `InternalError`: 内部服务器错误

## 开发

### 项目结构

```
file-reader-mcp/
├── index.js          # 主服务器文件
├── package.json      # 项目配置
└── readme.md         # 使用说明
```

### 技术栈

- **Node.js 18+**: 运行时环境
- **@modelcontextprotocol/sdk**: MCP 协议实现
- **ES Modules**: 现代 JavaScript 模块系统

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！