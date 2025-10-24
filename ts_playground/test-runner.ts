// Promise A+ 测试运行器
import { runCustomTests } from './custom-tests';
import { MyPromise } from './promise';

console.log('🔍 Promise A+ 规范符合性测试');
console.log('================================');
console.log('');

// 显示测试说明
console.log('📋 测试说明:');
console.log('1. 自定义测试用例 - 验证基本功能和边界情况');
console.log('2. 官方测试套件 - 需要安装 promises-aplus-tests');
console.log('');

// 运行自定义测试
console.log('开始运行自定义测试用例...');
runCustomTests();

// 显示如何运行官方测试的说明
setTimeout(() => {
  console.log('');
  console.log('📦 如何运行官方 Promise A+ 测试套件:');
  console.log('1. 安装测试套件: npm install promises-aplus-tests --save-dev');
  console.log('2. 编译 TypeScript: tsc promise.ts --target es2015 --module commonjs --outFile promise-compiled.js');
  console.log('3. 运行测试: npx promises-aplus-tests promise-adapter.js');
  console.log('');
  console.log('💡 提示: 官方测试套件包含 872 个测试用例，全部通过表示完全符合 Promise A+ 规范');
}, 3000);

// 导出测试函数供其他文件使用
export { runCustomTests };
export { MyPromise };