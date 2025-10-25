#!/bin/bash

# NestJS 学习项目 - API 测试脚本
# 使用此脚本快速测试各个 API 端点

BASE_URL="http://localhost:3000"

echo "========================================"
echo "NestJS 学习项目 - API 测试"
echo "========================================"
echo ""
echo "请确保服务已启动: npm run start:dev"
echo ""
echo "按回车开始测试..."
read

echo "========================================"
echo "1. 测试基础路由"
echo "========================================"
curl -s "$BASE_URL" | jq '.'
echo ""

echo "========================================"
echo "2. 创建用户"
echo "========================================"
curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "age": 28}' | jq '.'
echo ""

echo "========================================"
echo "3. 获取所有用户"
echo "========================================"
curl -s "$BASE_URL/users" | jq '.'
echo ""

echo "========================================"
echo "4. 获取单个用户 (ID: 1)"
echo "========================================"
curl -s "$BASE_URL/users/1" | jq '.'
echo ""

echo "========================================"
echo "5. 测试示例 - 基础路由"
echo "========================================"
curl -s "$BASE_URL/examples/basic" | jq '.'
echo ""

echo "========================================"
echo "6. 测试示例 - 带拦截器的路由"
echo "========================================"
curl -s "$BASE_URL/examples/with-interceptor" | jq '.'
echo ""

echo "========================================"
echo "7. 测试示例 - 受保护的路由 (无 token - 应该失败)"
echo "========================================"
curl -s "$BASE_URL/examples/protected" | jq '.'
echo ""

echo "========================================"
echo "8. 测试示例 - 受保护的路由 (有效 token)"
echo "========================================"
curl -s -H "Authorization: Bearer valid-token" "$BASE_URL/examples/protected" | jq '.'
echo ""

echo "========================================"
echo "9. 测试数据验证 - 有效数据"
echo "========================================"
curl -s -X POST "$BASE_URL/examples/validate" \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com"}' | jq '.'
echo ""

echo "========================================"
echo "10. 测试数据验证 - 无效邮箱 (应该失败)"
echo "========================================"
curl -s -X POST "$BASE_URL/examples/validate" \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "invalid-email"}' | jq '.'
echo ""

echo "========================================"
echo "11. 测试异常处理"
echo "========================================"
curl -s "$BASE_URL/examples/error" | jq '.'
echo ""

echo "========================================"
echo "测试完成!"
echo "========================================"
