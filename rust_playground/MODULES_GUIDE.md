# Rust 模块系统演示指南

这个项目演示了 Rust 中的模块系统和文件互相导入的实现方式。

## 📁 项目结构

```
rust_playground/
├── src/
│   ├── main.rs      # 主程序入口，声明并使用其他模块
│   ├── example.rs   # 包含各种 Rust 语法实例的模块
│   └── utils.rs     # 工具函数模块
├── Cargo.toml
└── MODULES_GUIDE.md # 本文件
```

## 🔗 模块导入机制

### 1. 在 main.rs 中声明模块

在 Rust 中，要使用其他文件中的代码，首先需要在 `main.rs`（或 `lib.rs`）中声明模块：

```rust
mod example;  // 告诉编译器包含 src/example.rs
mod utils;    // 告诉编译器包含 src/utils.rs
```

### 2. 导入模块中的项

声明模块后，可以使用 `use` 语句导入具体的函数、结构体等：

```rust
use example::run_all_examples;
use utils::{multiply, string_utils, math_utils};
```

### 3. 跨模块引用

在 `example.rs` 中，我们可以导入 `utils` 模块的内容：

```rust
// 在 example.rs 中
use crate::utils::{add, multiply, greet};
```

**注意**: 使用 `crate::` 前缀表示从项目根部开始的路径。

## 📝 关键概念

### mod 关键字

`mod` 有两种用法：

1. **声明文件模块**（在 main.rs 中）：
   ```rust
   mod utils;  // 查找 src/utils.rs 或 src/utils/mod.rs
   ```

2. **声明内联模块**（在文件内部）：
   ```rust
   pub mod string_utils {
       pub fn reverse(s: &str) -> String {
           // ...
       }
   }
   ```

### use 关键字

`use` 用于将模块中的项引入当前作用域：

```rust
use utils::add;                    // 导入单个函数
use utils::{add, multiply};        // 导入多个函数
use utils::math_utils::average;    // 导入子模块中的函数
use utils::*;                      // 导入所有公开项（不推荐）
```

### pub 关键字

只有标记为 `pub` 的项才能被其他模块访问：

```rust
pub fn add(a: i32, b: i32) -> i32 {  // 公开函数
    a + b
}

fn private_func() {  // 私有函数，仅模块内可用
    // ...
}
```

### crate 关键字

`crate` 表示当前 crate 的根：

```rust
use crate::utils::add;  // 从 crate 根开始的绝对路径
```

## 🚀 运行示例

```bash
# 编译项目
cargo build

# 运行项目
cargo run

# 运行测试
cargo test
```

## 📚 代码示例详解

### example.rs 中导入 utils

```rust
// example.rs 的顶部
use crate::utils::{add, multiply, greet};

// 然后在函数中使用
pub fn functions_demo() {
    println!("使用 utils::add: 10 + 20 = {}", add(10, 20));
}
```

### main.rs 中使用两个模块

```rust
// 声明模块
mod example;
mod utils;

// 导入需要的项
use example::run_all_examples;
use utils::{multiply, string_utils};

fn main() {
    // 使用已导入的函数
    run_all_examples();

    // 使用已导入的子模块
    let text = "Hello";
    println!("{}", string_utils::reverse(text));

    // 使用完整路径（无需 use 导入）
    println!("{}", utils::add(10, 20));
}
```

## ⚠️ 注意事项

### 1. 循环依赖

Rust **不允许真正的循环依赖**。例如：

```
❌ 错误示例：
module A imports B
module B imports A
```

如果需要模块间协作，应该：
- 将共享代码提取到第三个模块
- 使用 trait 和依赖注入
- 重新设计模块结构

### 2. 命名冲突

如果导入的项与本地定义冲突，可以使用别名：

```rust
use utils::add as utils_add;

fn add(x: u32, y: u32) -> u32 {  // 本地的 add 函数
    x + y
}

fn main() {
    println!("{}", add(1, 2));        // 调用本地的
    println!("{}", utils_add(1, 2));  // 调用 utils 的
}
```

### 3. 文件和目录模块

对于更复杂的模块结构：

```
src/
├── main.rs
├── utils.rs        # 简单模块
└── parser/         # 目录模块
    ├── mod.rs      # parser 模块的入口
    ├── json.rs
    └── xml.rs
```

在 `main.rs` 中：
```rust
mod utils;
mod parser;  // 会查找 src/parser/mod.rs
```

## 🎯 学习要点

1. **模块声明**: 使用 `mod` 在 main.rs 中声明
2. **导入项**: 使用 `use` 导入需要的函数/类型
3. **可见性**: 使用 `pub` 标记公开项
4. **路径**: 使用 `crate::` 或相对路径引用其他模块
5. **子模块**: 可以在文件内部使用 `mod` 创建子模块
6. **避免循环**: 设计清晰的模块依赖层次

## 📖 相关文档

- [Rust Book - 模块系统](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [Rust By Example - 模块](https://doc.rust-lang.org/rust-by-example/mod.html)
