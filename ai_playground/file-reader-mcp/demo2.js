import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client(
  {
    name: "my-app",
    version: "1.0.0",
  },
  { capabilities: {} }
);

const transport = new StdioClientTransport({
  command: "node",
  args: ["./file-reader-mcp/index.js"],
});

await client.connect(transport);

// 读取文件
const result = await client.callTool({
  name: "read_file",
  arguments: { path: "./my-file.txt" },
});

console.log(result.content[0].text);
