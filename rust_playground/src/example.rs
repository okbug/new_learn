// Rust 基础语法实例集合

// 从 utils 模块导入函数
use crate::utils::{add, multiply, greet};

/// 1. 变量与可变性
pub fn variables_demo() {
    println!("\n=== 变量与可变性 ===");

    // 不可变变量
    let x = 5;
    println!("不可变变量 x = {}", x);

    // 可变变量
    let mut y = 10;
    println!("可变变量 y = {}", y);
    y = 20;
    println!("修改后 y = {}", y);

    // 常量
    const MAX_POINTS: u32 = 100_000;
    println!("常量 MAX_POINTS = {}", MAX_POINTS);

    // 变量遮蔽 (shadowing)
    let z = 5;
    let z = z + 1;
    let z = z * 2;
    println!("遮蔽后的 z = {}", z);
}

/// 2. 数据类型
pub fn data_types_demo() {
    println!("\n=== 数据类型 ===");

    // 整数类型
    let a: i32 = 42;
    let b: u64 = 100;
    println!("整数: i32={}, u64={}", a, b);

    // 浮点数
    let f1: f64 = 3.14;
    let f2: f32 = 2.71;
    println!("浮点数: f64={}, f32={}", f1, f2);

    // 布尔值
    let is_true: bool = true;
    println!("布尔值: {}", is_true);

    // 字符
    let c: char = '😀';
    println!("字符: {}", c);

    // 元组
    let tuple: (i32, f64, char) = (500, 6.4, 'x');
    println!("元组: ({}, {}, {})", tuple.0, tuple.1, tuple.2);

    // 数组
    let array = [1, 2, 3, 4, 5];
    println!("数组第一个元素: {}", array[0]);
}

/// 3. 函数
pub fn functions_demo() {
    println!("\n=== 函数 ===");

    // 调用本地函数
    let sum = add_numbers(5, 3);
    println!("5 + 3 = {}", sum);

    // 调用从 utils 模块导入的函数
    println!("使用 utils::add: 10 + 20 = {}", add(10, 20));
    println!("使用 utils::multiply: 5 * 4 = {}", multiply(5, 4));
    println!("{}", greet("Rust"));
}

fn add_numbers(a: i32, b: i32) -> i32 {
    a + b  // 表达式，没有分号
}

/// 4. 控制流
pub fn control_flow_demo() {
    println!("\n=== 控制流 ===");

    // if 表达式
    let number = 6;
    if number % 4 == 0 {
        println!("{} 能被 4 整除", number);
    } else if number % 3 == 0 {
        println!("{} 能被 3 整除", number);
    } else {
        println!("{} 不能被 4 或 3 整除", number);
    }

    // if 作为表达式
    let condition = true;
    let value = if condition { 5 } else { 6 };
    println!("if 表达式的值: {}", value);

    // loop 循环
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
    println!("loop 循环结果: {}", result);

    // while 循环
    let mut n = 3;
    while n > 0 {
        print!("{}... ", n);
        n -= 1;
    }
    println!("发射！");

    // for 循环
    let arr = [10, 20, 30, 40, 50];
    for element in arr.iter() {
        print!("{} ", element);
    }
    println!();

    // range
    for i in 1..=5 {
        print!("{} ", i);
    }
    println!();
}

/// 5. 所有权 (Ownership)
pub fn ownership_demo() {
    println!("\n=== 所有权 ===");

    // String 所有权转移
    let s1 = String::from("hello");
    let s2 = s1;  // s1 的所有权移动到 s2
    // println!("{}", s1);  // 这行会报错，因为 s1 已经无效
    println!("s2 = {}", s2);

    // 克隆
    let s3 = String::from("world");
    let s4 = s3.clone();
    println!("s3 = {}, s4 = {}", s3, s4);

    // 函数与所有权
    let s = String::from("ownership");
    takes_ownership(s);
    // println!("{}", s);  // 这行会报错

    let x = 5;
    makes_copy(x);
    println!("x 仍然有效: {}", x);  // i32 实现了 Copy trait
}

fn takes_ownership(some_string: String) {
    println!("接收所有权: {}", some_string);
}

fn makes_copy(some_integer: i32) {
    println!("复制值: {}", some_integer);
}

/// 6. 引用与借用
pub fn references_demo() {
    println!("\n=== 引用与借用 ===");

    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("'{}' 的长度是 {}", s1, len);

    // 可变引用
    let mut s = String::from("hello");
    change(&mut s);
    println!("修改后: {}", s);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}

/// 7. 结构体
pub fn struct_demo() {
    println!("\n=== 结构体 ===");

    let user1 = User {
        username: String::from("Alice"),
        email: String::from("alice@example.com"),
        active: true,
        sign_in_count: 1,
    };

    println!("用户: {}, 邮箱: {}", user1.username, user1.email);

    // 元组结构体
    let black = Color(0, 0, 0);
    println!("颜色: RGB({}, {}, {})", black.0, black.1, black.2);

    // 带方法的结构体
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    println!("矩形面积: {}", rect.area());
    println!("矩形信息: {:#?}", rect);
}

struct User {
    username: String,
    email: String,
    active: bool,
    sign_in_count: u64,
}

struct Color(i32, i32, i32);

#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

/// 8. 枚举与模式匹配
pub fn enum_demo() {
    println!("\n=== 枚举与模式匹配 ===");

    let msg1 = Message::Write(String::from("Hello"));
    let msg2 = Message::Move { x: 10, y: 20 };

    process_message(msg1);
    process_message(msg2);

    // Option 枚举
    let some_number = Some(5);
    let no_number: Option<i32> = None;

    if let Some(n) = some_number {
        println!("数字是: {}", n);
    }

    match no_number {
        Some(n) => println!("数字是: {}", n),
        None => println!("没有数字"),
    }
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => println!("退出"),
        Message::Move { x, y } => println!("移动到 ({}, {})", x, y),
        Message::Write(text) => println!("写入: {}", text),
        Message::ChangeColor(r, g, b) => println!("改变颜色到 RGB({}, {}, {})", r, g, b),
    }
}

/// 9. 向量 (Vector)
pub fn vector_demo() {
    println!("\n=== 向量 ===");

    let mut v = vec![1, 2, 3, 4, 5];
    println!("向量: {:?}", v);

    v.push(6);
    println!("添加元素后: {:?}", v);

    // 访问元素
    let third = &v[2];
    println!("第三个元素: {}", third);

    // 遍历
    print!("遍历向量: ");
    for i in &v {
        print!("{} ", i);
    }
    println!();

    // 可变遍历
    for i in &mut v {
        *i += 50;
    }
    println!("每个元素加 50: {:?}", v);
}

/// 10. 字符串
pub fn string_demo() {
    println!("\n=== 字符串 ===");

    let mut s = String::from("Hello");
    s.push_str(", world!");
    println!("{}", s);

    // 字符串拼接
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2;  // s1 被移动，不能再使用
    println!("拼接结果: {}", s3);

    // format! 宏
    let s4 = String::from("Rust");
    let s5 = String::from("Programming");
    let s6 = format!("{} {}", s4, s5);
    println!("format 结果: {}", s6);

    // 遍历字符串
    for c in "नमस्ते".chars() {
        print!("{} ", c);
    }
    println!();
}

/// 11. HashMap
pub fn hashmap_demo() {
    println!("\n=== HashMap ===");

    use std::collections::HashMap;

    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    println!("HashMap: {:?}", scores);

    // 访问值
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);
    match score {
        Some(s) => println!("{} 队得分: {}", team_name, s),
        None => println!("没有找到该队"),
    }

    // 遍历
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }

    // 只在键没有对应值时插入
    scores.entry(String::from("Red")).or_insert(25);
    scores.entry(String::from("Blue")).or_insert(30);  // 不会覆盖
    println!("更新后: {:?}", scores);
}

/// 运行所有示例
pub fn run_all_examples() {
    println!("🦀 Rust 语法实例演示开始！");

    variables_demo();
    data_types_demo();
    functions_demo();
    control_flow_demo();
    ownership_demo();
    references_demo();
    struct_demo();
    enum_demo();
    vector_demo();
    string_demo();
    hashmap_demo();

    println!("\n✅ 所有示例运行完成！");
}
