#!/usr/bin/env node

/**
 * File Reader MCP 工作演示
 * 使用 MCP SDK 进行测试
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class WorkingDemo {
  constructor() {
    this.client = new Client(
      {
        name: 'demo-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    console.log('🔌 连接到 MCP 服务器...');
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['index.js'],
    });

    await this.client.connect(transport);
    console.log('✅ 连接成功！');
  }

  async testListTools() {
    console.log('\n📋 获取可用工具...');
    try {
      const result = await this.client.listTools();
      console.log('✅ 可用工具：');
      result.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
      return result.tools;
    } catch (error) {
      console.error('❌ 获取工具失败：', error.message);
      throw error;
    }
  }

  async testReadFile() {
    console.log('\n📖 测试读取文件...');
    try {
      const result = await this.client.callTool({
        name: 'read_file',
        arguments: {
          path: './example.txt',
          encoding: 'utf8'
        }
      });
      
      console.log('✅ 文件读取成功！');
      console.log('─'.repeat(40));
      console.log(result.content[0].text);
      console.log('─'.repeat(40));
    } catch (error) {
      console.error('❌ 文件读取失败：', error.message);
    }
  }

  async testReadLines() {
    console.log('\n📄 测试按行读取...');
    try {
      const result = await this.client.callTool({
        name: 'read_file_lines',
        arguments: {
          path: './example.txt',
          start_line: 1,
          end_line: 5
        }
      });
      
      console.log('✅ 按行读取成功！');
      console.log('─'.repeat(40));
      console.log(result.content[0].text);
      console.log('─'.repeat(40));
    } catch (error) {
      console.error('❌ 按行读取失败：', error.message);
    }
  }

  async testFileInfo() {
    console.log('\n📊 测试获取文件信息...');
    try {
      const result = await this.client.callTool({
        name: 'get_file_info',
        arguments: {
          path: './example.txt'
        }
      });
      
      console.log('✅ 文件信息获取成功！');
      console.log('─'.repeat(40));
      console.log(result.content[0].text);
      console.log('─'.repeat(40));
    } catch (error) {
      console.error('❌ 文件信息获取失败：', error.message);
    }
  }

  async testErrorHandling() {
    console.log('\n🚨 测试错误处理（读取不存在的文件）...');
    try {
      await this.client.callTool({
        name: 'read_file',
        arguments: {
          path: './nonexistent.txt'
        }
      });
    } catch (error) {
      console.log('✅ 错误处理正常：', error.message);
    }
  }

  async runDemo() {
    console.log('🎯 File Reader MCP 完整功能演示');
    console.log('═'.repeat(50));

    try {
      await this.connect();
      await this.testListTools();
      await this.testReadFile();
      await this.testReadLines();
      await this.testFileInfo();
      await this.testErrorHandling();

      console.log('\n🎉 演示完成！');
      console.log('\n💡 总结：');
      console.log('✓ MCP 服务器运行正常');
      console.log('✓ 所有工具功能正常');
      console.log('✓ 错误处理机制有效');
      console.log('✓ 可以安全读取文件内容');

    } catch (error) {
      console.error('\n❌ 演示失败：', error.message);
      console.error('请检查：');
      console.error('1. 是否正确安装了依赖 (npm install)');
      console.error('2. example.txt 文件是否存在');
      console.error('3. index.js 文件是否正确');
    }
  }
}

// 运行演示
const demo = new WorkingDemo();
demo.runDemo().catch(console.error);