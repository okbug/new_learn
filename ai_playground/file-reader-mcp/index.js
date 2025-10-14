#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

class FileReaderServer {
  constructor() {
    this.server = new Server(
      {
        name: "file-reader-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 列出可用的工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "read_file",
            description: "读取指定文件的内容",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "要读取的文件路径（绝对路径或相对路径）",
                },
                encoding: {
                  type: "string",
                  description: "文件编码格式（默认为 utf8）",
                  default: "utf8",
                  enum: ["utf8", "ascii", "base64", "hex", "binary"],
                },
              },
              required: ["path"],
            },
          },
          {
            name: "read_file_lines",
            description: "读取文件的指定行范围",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "要读取的文件路径",
                },
                start_line: {
                  type: "number",
                  description: "起始行号（从1开始）",
                  minimum: 1,
                },
                end_line: {
                  type: "number",
                  description: "结束行号（包含该行）",
                  minimum: 1,
                },
                encoding: {
                  type: "string",
                  description: "文件编码格式（默认为 utf8）",
                  default: "utf8",
                },
              },
              required: ["path", "start_line", "end_line"],
            },
          },
          {
            name: "get_file_info",
            description: "获取文件的基本信息（大小、修改时间等）",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "要查询的文件路径",
                },
              },
              required: ["path"],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "read_file":
            return await this.readFile(args);
          case "read_file_lines":
            return await this.readFileLines(args);
          case "get_file_info":
            return await this.getFileInfo(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `未知的工具: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败: ${error.message}`
        );
      }
    });
  }

  async readFile(args) {
    const { path: filePath, encoding = "utf8" } = args;

    if (!filePath) {
      throw new McpError(ErrorCode.InvalidParams, "文件路径不能为空");
    }

    try {
      // 安全检查：确保路径不包含危险字符
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes("..")) {
        throw new McpError(ErrorCode.InvalidParams, "不允许访问上级目录");
      }

      const content = await fs.readFile(normalizedPath, encoding);
      const stats = await fs.stat(normalizedPath);

      return {
        content: [
          {
            type: "text",
            text: `文件路径: ${normalizedPath}\n文件大小: ${stats.size} 字节\n编码格式: ${encoding}\n\n文件内容:\n${content}`,
          },
        ],
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new McpError(ErrorCode.InvalidParams, `文件不存在: ${filePath}`);
      }
      if (error.code === "EACCES") {
        throw new McpError(
          ErrorCode.InvalidParams,
          `没有权限访问文件: ${filePath}`
        );
      }
      if (error.code === "EISDIR") {
        throw new McpError(
          ErrorCode.InvalidParams,
          `路径是目录而不是文件: ${filePath}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `读取文件失败: ${error.message}`
      );
    }
  }

  async readFileLines(args) {
    const { path: filePath, start_line, end_line, encoding = "utf8" } = args;

    if (!filePath) {
      throw new McpError(ErrorCode.InvalidParams, "文件路径不能为空");
    }

    if (start_line > end_line) {
      throw new McpError(ErrorCode.InvalidParams, "起始行号不能大于结束行号");
    }

    try {
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes("..")) {
        throw new McpError(ErrorCode.InvalidParams, "不允许访问上级目录");
      }

      const content = await fs.readFile(normalizedPath, encoding);
      const lines = content.split("\n");

      if (start_line > lines.length) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `起始行号 ${start_line} 超出文件总行数 ${lines.length}`
        );
      }

      const selectedLines = lines.slice(start_line - 1, end_line);
      const result = selectedLines.join("\n");

      return {
        content: [
          {
            type: "text",
            text: `文件路径: ${normalizedPath}\n行范围: ${start_line}-${Math.min(
              end_line,
              lines.length
            )}\n总行数: ${lines.length}\n\n内容:\n${result}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      if (error.code === "ENOENT") {
        throw new McpError(ErrorCode.InvalidParams, `文件不存在: ${filePath}`);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `读取文件行失败: ${error.message}`
      );
    }
  }

  async getFileInfo(args) {
    const { path: filePath } = args;

    if (!filePath) {
      throw new McpError(ErrorCode.InvalidParams, "文件路径不能为空");
    }

    try {
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes("..")) {
        throw new McpError(ErrorCode.InvalidParams, "不允许访问上级目录");
      }

      const stats = await fs.stat(normalizedPath);
      const parsedPath = path.parse(normalizedPath);

      return {
        content: [
          {
            type: "text",
            text: `文件信息:
路径: ${normalizedPath}
文件名: ${parsedPath.base}
扩展名: ${parsedPath.ext}
目录: ${parsedPath.dir}
大小: ${stats.size} 字节
是否为文件: ${stats.isFile()}
是否为目录: ${stats.isDirectory()}
创建时间: ${stats.birthtime.toISOString()}
修改时间: ${stats.mtime.toISOString()}
访问时间: ${stats.atime.toISOString()}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      if (error.code === "ENOENT") {
        throw new McpError(ErrorCode.InvalidParams, `文件不存在: ${filePath}`);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `获取文件信息失败: ${error.message}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("File Reader MCP 服务器已启动");
  }
}

const server = new FileReaderServer();
server.run().catch(console.error);
