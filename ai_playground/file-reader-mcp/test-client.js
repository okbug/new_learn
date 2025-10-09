#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class FileReaderMCPClient {
  constructor() {
    this.client = new Client(
      {
        name: 'file-reader-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    // 启动 MCP 服务器进程
    const serverProcess = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd(),
    });

    // 创建传输层
    const transport = new StdioClientTransport({
      stdin: serverProcess.stdin,
      stdout: serverProcess.stdout,
    });

    // 连接到服务器
    await this.client.connect(transport);
    console.log('✅ 已连接到 File Reader MCP 服务器');

    return serverProcess;
  }

  async listTools() {
    console.log('\n📋 获取可用工具列表...');
    const result = await this.client.listTools();
    console.log('可用工具：');
    result.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
    });
    return result.tools;
  }

  async testReadFile() {
    console.log('\n📖 测试读取文件内容...');
    try {
      const result = await this.client.callTool({
        name: 'read_file',
        arguments: {
          path: './example.txt',
          encoding: 'utf8'
        }
      });
      
      console.log('✅ 文件读取成功：');
      console.log(result.content[0].text);
    } catch (error) {
      console.error('❌ 文件读取失败：', error.message);
    }
  }

  async testReadFileLines() {
    console.log('\n📄 测试按行范围读取文件...');
    try {
      const result = await this.client.callTool({
        name: 'read_file_lines',
        arguments: {
          path: './example.txt',
          start_line: 1,
          end_line: 5
        }
      });
      
      console.log('✅ 按行读取成功：');
      console.log(result.content[0].text);
    } catch (error) {
      console.error('❌ 按行读取失败：', error.message);
    }
  }

  async testGetFileInfo() {
    console.log('\n📊 测试获取文件信息...');
    try {
      const result = await this.client.callTool({
        name: 'get_file_info',
        arguments: {
          path: './example.txt'
        }
      });
      
      console.log('✅ 文件信息获取成功：');
      console.log(result.content[0].text);
    } catch (error) {
      console.error('❌ 文件信息获取失败：', error.message);
    }
  }

  async testErrorHandling() {
    console.log('\n🚨 测试错误处理...');
    try {
      const result = await this.client.callTool({
        name: 'read_file',
        arguments: {
          path: './nonexistent.txt'
        }
      });
    } catch (error) {
      console.log('✅ 错误处理正常：', error.message);
    }
  }

  async runAllTests() {
    let serverProcess;
    
    try {
      // 连接到服务器
      serverProcess = await this.connect();
      
      // 运行所有测试
      await this.listTools();
      await this.testReadFile();
      await this.testReadFileLines();
      await this.testGetFileInfo();
      await this.testErrorHandling();
      
      console.log('\n🎉 所有测试完成！');
      
    } catch (error) {
      console.error('❌ 测试过程中出现错误：', error);
    } finally {
      // 清理资源
      if (serverProcess) {
        serverProcess.kill();
        console.log('\n🔌 已断开与服务器的连接');
      }
    }
  }
}

// 运行测试
const client = new FileReaderMCPClient();
client.runAllTests().catch(console.error);