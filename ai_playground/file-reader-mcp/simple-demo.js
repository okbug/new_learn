#!/usr/bin/env node

/**
 * 简单的 File Reader MCP Demo
 * 这个脚本会启动 MCP 服务器并测试其功能
 */

import { spawn } from 'child_process';
import { createReadline } from 'readline';

class SimpleMCPDemo {
  constructor() {
    this.serverProcess = null;
  }

  // 启动 MCP 服务器
  async startServer() {
    console.log('🚀 启动 File Reader MCP 服务器...');
    
    this.serverProcess = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd()
    });

    // 等待服务器启动
    await new Promise((resolve) => {
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('File Reader MCP 服务器已启动')) {
          console.log('✅ 服务器启动成功！');
          resolve();
        }
      });
    });

    return this.serverProcess;
  }

  // 发送 JSON-RPC 请求
  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      let responseData = '';
      
      // 监听响应
      const onData = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          this.serverProcess.stdout.off('data', onData);
          resolve(response);
        } catch (e) {
          // 继续等待更多数据
        }
      };

      this.serverProcess.stdout.on('data', onData);
      
      // 发送请求
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
      
      // 超时处理
      setTimeout(() => {
        this.serverProcess.stdout.off('data', onData);
        reject(new Error('请求超时'));
      }, 5000);
    });
  }

  // 测试获取工具列表
  async testListTools() {
    console.log('\n📋 测试：获取工具列表');
    try {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const response = await this.sendRequest(request);
      console.log('✅ 成功获取工具列表：');
      response.result.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    } catch (error) {
      console.error('❌ 获取工具列表失败：', error.message);
    }
  }

  // 测试读取文件
  async testReadFile() {
    console.log('\n📖 测试：读取文件内容');
    try {
      const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'read_file',
          arguments: {
            path: './example.txt',
            encoding: 'utf8'
          }
        }
      };

      const response = await this.sendRequest(request);
      console.log('✅ 文件读取成功：');
      console.log(response.result.content[0].text);
    } catch (error) {
      console.error('❌ 文件读取失败：', error.message);
    }
  }

  // 测试按行读取
  async testReadLines() {
    console.log('\n📄 测试：按行读取文件');
    try {
      const request = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'read_file_lines',
          arguments: {
            path: './example.txt',
            start_line: 1,
            end_line: 3
          }
        }
      };

      const response = await this.sendRequest(request);
      console.log('✅ 按行读取成功：');
      console.log(response.result.content[0].text);
    } catch (error) {
      console.error('❌ 按行读取失败：', error.message);
    }
  }

  // 测试获取文件信息
  async testFileInfo() {
    console.log('\n📊 测试：获取文件信息');
    try {
      const request = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_file_info',
          arguments: {
            path: './example.txt'
          }
        }
      };

      const response = await this.sendRequest(request);
      console.log('✅ 文件信息获取成功：');
      console.log(response.result.content[0].text);
    } catch (error) {
      console.error('❌ 文件信息获取失败：', error.message);
    }
  }

  // 清理资源
  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('\n🔌 服务器已关闭');
    }
  }

  // 运行完整演示
  async runDemo() {
    console.log('🎯 File Reader MCP 功能演示');
    console.log('═'.repeat(50));

    try {
      // 启动服务器
      await this.startServer();

      // 运行测试
      await this.testListTools();
      await this.testReadFile();
      await this.testReadLines();
      await this.testFileInfo();

      console.log('\n🎉 所有测试完成！');
      console.log('\n💡 提示：');
      console.log('- MCP 服务器可以与 AI 助手集成');
      console.log('- 支持安全的文件读取操作');
      console.log('- 提供详细的错误处理');

    } catch (error) {
      console.error('❌ 演示过程中出现错误：', error.message);
    } finally {
      this.cleanup();
    }
  }
}

// 运行演示
const demo = new SimpleMCPDemo();

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n\n👋 收到退出信号，正在清理...');
  demo.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  demo.cleanup();
  process.exit(0);
});

// 开始演示
demo.runDemo().catch((error) => {
  console.error('演示失败：', error);
  demo.cleanup();
  process.exit(1);
});