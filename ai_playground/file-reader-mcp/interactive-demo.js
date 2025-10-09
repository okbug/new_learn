#!/usr/bin/env node

/**
 * File Reader MCP 交互式演示
 * 用户可以手动测试各种功能
 */

import { spawn } from "child_process";
import readline from "readline";

class InteractiveDemo {
  constructor() {
    this.serverProcess = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async startServer() {
    console.log("🚀 启动 MCP 服务器...");

    this.serverProcess = spawn("node", ["index.js"], {
      stdio: ["pipe", "pipe", "inherit"],
    });

    // 等待服务器启动消息
    return new Promise((resolve) => {
      this.serverProcess.stdout.on("data", (data) => {
        const output = data.toString();
        if (output.includes("File Reader MCP 服务器已启动")) {
          console.log("✅ 服务器启动成功！\n");
          resolve();
        }
      });
    });
  }

  async sendJsonRpc(request) {
    return new Promise((resolve, reject) => {
      let responseData = "";

      const onData = (data) => {
        responseData += data.toString();
        try {
          const lines = responseData.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                this.serverProcess.stdout.off("data", onData);
                resolve(response);
                return;
              }
            } catch (e) {
              // 继续处理下一行
            }
          }
        } catch (e) {
          // 继续等待更多数据
        }
      };

      this.serverProcess.stdout.on("data", onData);
      this.serverProcess.stdin.write(JSON.stringify(request) + "\n");

      setTimeout(() => {
        this.serverProcess.stdout.off("data", onData);
        reject(new Error("请求超时"));
      }, 5000);
    });
  }

  async showMenu() {
    console.log("\n📋 可用操作：");
    console.log("1. 列出所有工具");
    console.log("2. 读取文件内容");
    console.log("3. 按行读取文件");
    console.log("4. 获取文件信息");
    console.log("5. 测试错误处理");
    console.log("0. 退出");
    console.log("─".repeat(30));
  }

  async getUserInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async listTools() {
    console.log("\n📋 获取工具列表...");
    try {
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/list",
        params: {},
      };

      const response = await this.sendJsonRpc(request);
      console.log("✅ 可用工具：");
      response.result.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    } catch (error) {
      console.error("❌ 获取工具列表失败：", error.message);
    }
  }

  async readFile() {
    const filePath = await this.getUserInput(
      "请输入文件路径 (默认: ./example.txt): "
    );
    const path = filePath.trim() || "./example.txt";

    console.log(`\n📖 读取文件: ${path}`);
    try {
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "read_file",
          arguments: {
            path: path,
            encoding: "utf8",
          },
        },
      };

      const response = await this.sendJsonRpc(request);
      console.log("✅ 文件读取成功：");
      console.log("─".repeat(40));
      console.log(response.result.content[0].text);
      console.log("─".repeat(40));
    } catch (error) {
      console.error("❌ 文件读取失败：", error.message);
    }
  }

  async readFileLines() {
    const filePath = await this.getUserInput(
      "请输入文件路径 (默认: ./example.txt): "
    );
    const startLine = await this.getUserInput("请输入起始行号 (默认: 1): ");
    const endLine = await this.getUserInput("请输入结束行号 (默认: 5): ");

    const path = filePath.trim() || "./example.txt";
    const start = parseInt(startLine.trim()) || 1;
    const end = parseInt(endLine.trim()) || 5;

    console.log(`\n📄 按行读取文件: ${path} (行 ${start}-${end})`);
    try {
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "read_file_lines",
          arguments: {
            path: path,
            start_line: start,
            end_line: end,
          },
        },
      };

      const response = await this.sendJsonRpc(request);
      console.log("✅ 按行读取成功：");
      console.log("─".repeat(40));
      console.log(response.result.content[0].text);
      console.log("─".repeat(40));
    } catch (error) {
      console.error("❌ 按行读取失败：", error.message);
    }
  }

  async getFileInfo() {
    const filePath = await this.getUserInput(
      "请输入文件路径 (默认: ./example.txt): "
    );
    const path = filePath.trim() || "./example.txt";

    console.log(`\n📊 获取文件信息: ${path}`);
    try {
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "get_file_info",
          arguments: {
            path: path,
          },
        },
      };

      const response = await this.sendJsonRpc(request);
      console.log("✅ 文件信息获取成功：");
      console.log("─".repeat(40));
      console.log(response.result.content[0].text);
      console.log("─".repeat(40));
    } catch (error) {
      console.error("❌ 文件信息获取失败：", error.message);
    }
  }

  async testError() {
    console.log("\n🚨 测试错误处理（读取不存在的文件）...");
    try {
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "read_file",
          arguments: {
            path: "./nonexistent-file.txt",
          },
        },
      };

      await this.sendJsonRpc(request);
    } catch (error) {
      console.log("✅ 错误处理正常：", error.message);
    }
  }

  async runInteractiveDemo() {
    console.log("🎯 File Reader MCP 交互式演示");
    console.log("═".repeat(50));

    try {
      await this.startServer();

      while (true) {
        await this.showMenu();
        const choice = await this.getUserInput("请选择操作 (0-5): ");

        switch (choice.trim()) {
          case "1":
            await this.listTools();
            break;
          case "2":
            await this.readFile();
            break;
          case "3":
            await this.readFileLines();
            break;
          case "4":
            await this.getFileInfo();
            break;
          case "5":
            await this.testError();
            break;
          case "0":
            console.log("\n👋 感谢使用！");
            return;
          default:
            console.log("❌ 无效选择，请重试");
        }
      }
    } catch (error) {
      console.error("❌ 演示失败：", error.message);
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    this.rl.close();
  }
}

// 运行交互式演示
const demo = new InteractiveDemo();

process.on("SIGINT", () => {
  console.log("\n\n👋 收到退出信号，正在清理...");
  demo.cleanup();
  process.exit(0);
});

demo.runInteractiveDemo().catch(console.error);
