#!/usr/bin/env node

/**
 * File Reader MCP 演示脚本
 * 
 * 这个脚本展示了如何通过 JSON-RPC 协议与 MCP 服务器交互
 * 注意：这是一个简化的演示，实际使用中建议使用 MCP SDK
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

class MCPDemo {
  constructor() {
    this.requestId = 1;
  }

  // 创建 JSON-RPC 请求
  createRequest(method, params = {}) {
    return {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: method,
      params: params
    };
  }

  // 演示获取工具列表
  async demoListTools() {
    console.log('📋 演示：获取可用工具列表');
    console.log('发送请求：');
    
    const request = this.createRequest('tools/list');
    console.log(JSON.stringify(request, null, 2));
    
    console.log('\n期望响应：包含 read_file, read_file_lines, get_file_info 三个工具');
    console.log('─'.repeat(50));
  }

  // 演示读取文件
  async demoReadFile() {
    console.log('\n📖 演示：读取文件内容');
    console.log('发送请求：');
    
    const request = this.createRequest('tools/call', {
      name: 'read_file',
      arguments: {
        path: './example.txt',
        encoding: 'utf8'
      }
    });
    console.log(JSON.stringify(request, null, 2));
    
    console.log('\n期望响应：返回文件的完整内容和元信息');
    console.log('─'.repeat(50));
  }

  // 演示按行读取
  async demoReadLines() {
    console.log('\n📄 演示：按行范围读取文件');
    console.log('发送请求：');
    
    const request = this.createRequest('tools/call', {
      name: 'read_file_lines',
      arguments: {
        path: './example.txt',
        start_line: 1,
        end_line: 5
      }
    });
    console.log(JSON.stringify(request, null, 2));
    
    console.log('\n期望响应：返回文件的前5行内容');
    console.log('─'.repeat(50));
  }

  // 演示获取文件信息
  async demoFileInfo() {
    console.log('\n📊 演示：获取文件信息');
    console.log('发送请求：');
    
    const request = this.createRequest('tools/call', {
      name: 'get_file_info',
      arguments: {
        path: './example.txt'
      }
    });
    console.log(JSON.stringify(request, null, 2));
    
    console.log('\n期望响应：返回文件的大小、修改时间等元数据');
    console.log('─'.repeat(50));
  }

  // 演示错误处理
  async demoErrorHandling() {
    console.log('\n🚨 演示：错误处理');
    console.log('发送请求（读取不存在的文件）：');
    
    const request = this.createRequest('tools/call', {
      name: 'read_file',
      arguments: {
        path: './nonexistent.txt'
      }
    });
    console.log(JSON.stringify(request, null, 2));
    
    console.log('\n期望响应：返回错误信息，错误码为 InvalidParams');
    console.log('─'.repeat(50));
  }

  async runDemo() {
    console.log('🎯 File Reader MCP 使用演示');
    console.log('═'.repeat(50));
    
    await this.demoListTools();
    await this.demoReadFile();
    await this.demoReadLines();
    await this.demoFileInfo();
    await this.demoErrorHandling();
    
    console.log('\n💡 实际使用说明：');
    console.log('1. MCP 服务器通过 stdio 进行通信');
    console.log('2. 使用 JSON-RPC 2.0 协议');
    console.log('3. 每个请求都需要包含 jsonrpc, id, method, params 字段');
    console.log('4. 服务器会返回对应的 JSON-RPC 响应');
    console.log('5. 在实际应用中，建议使用 @modelcontextprotocol/sdk');
    
    console.log('\n🔧 集成方式：');
    console.log('- Claude Desktop: 在配置文件中添加 MCP 服务器');
    console.log('- 自定义应用: 使用 MCP SDK 连接服务器');
    console.log('- 命令行: 直接通过 stdio 发送 JSON-RPC 请求');
    
    console.log('\n📚 更多信息请查看：');
    console.log('- readme.md: 基本使用说明');
    console.log('- usage-example.md: 详细使用示例');
  }
}

// 运行演示
const demo = new MCPDemo();
demo.runDemo().catch(console.error);