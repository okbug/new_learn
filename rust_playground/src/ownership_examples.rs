// ============================================
// Rust 所有权系统 - 深度示例
// ============================================

/// 演示所有权的基本规则
pub fn basic_ownership() {
    println!("\n=== 1. 基本所有权 ===");

    // 所有权规则1: 每个值都有一个所有者
    let s1 = String::from("hello");
    println!("s1 = {}", s1);

    // 所有权规则2: 值被移动后，原变量不可用
    let s2 = s1; // s1 的所有权移动到 s2
    println!("s2 = {}", s2);
    // println!("s1 = {}", s1); // ❌ 编译错误！s1 已经失效

    // 所有权规则3: 作用域结束时，值被释放
    {
        let s3 = String::from("temporary");
        println!("s3 = {}", s3);
    } // s3 在这里被释放
    // println!("{}", s3); // ❌ s3 已经不存在
}

/// Copy trait vs Move 语义
pub fn copy_vs_move() {
    println!("\n=== 2. Copy vs Move ===");

    // 实现了 Copy trait 的类型（栈上的数据）
    let x = 5;
    let y = x; // 这是复制，不是移动
    println!("x = {}, y = {}", x, y); // ✅ x 和 y 都可用

    // 常见的 Copy 类型：
    // - 所有整数类型：i32, u32, i64 等
    // - 布尔类型：bool
    // - 浮点类型：f32, f64
    // - 字符类型：char
    // - 元组（如果所有元素都是 Copy）
    let tuple = (1, 2.5, 'a');
    let tuple2 = tuple;
    println!("tuple = {:?}, tuple2 = {:?}", tuple, tuple2);

    // 没有实现 Copy trait 的类型（堆上的数据）
    let s1 = String::from("hello");
    let s2 = s1; // 这是移动
    // println!("s1 = {}", s1); // ❌ s1 已失效
    println!("s2 = {}", s2);

    // Vec 也是堆数据
    let v1 = vec![1, 2, 3];
    let v2 = v1; // 移动
    // println!("{:?}", v1); // ❌ v1 已失效
    println!("v2 = {:?}", v2);
}

/// Clone: 深拷贝
pub fn clone_example() {
    println!("\n=== 3. 使用 Clone 进行深拷贝 ===");

    let s1 = String::from("hello");
    let s2 = s1.clone(); // 显式深拷贝

    println!("s1 = {}, s2 = {}", s1, s2); // ✅ 两个都可用

    // Clone 的代价
    let large_vec = vec![1; 1000000]; // 100万个元素
    let cloned = large_vec.clone(); // 这会复制100万个元素！
    println!("Original length: {}, Cloned length: {}",
             large_vec.len(), cloned.len());
}

/// 函数和所有权
pub fn functions_and_ownership() {
    println!("\n=== 4. 函数和所有权 ===");

    let s = String::from("hello");

    // 将 s 传递给函数，所有权被移动
    takes_ownership(s);
    // println!("{}", s); // ❌ s 已经被移动

    let x = 5;
    makes_copy(x); // x 是 i32，实现了 Copy
    println!("x = {}", x); // ✅ x 仍然可用

    // 函数返回所有权
    let s1 = gives_ownership();
    println!("s1 from function: {}", s1);

    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2);
    // println!("{}", s2); // ❌ s2 已被移动
    println!("s3 = {}", s3);
}

fn takes_ownership(some_string: String) {
    println!("takes_ownership: {}", some_string);
} // some_string 在这里被释放

fn makes_copy(some_integer: i32) {
    println!("makes_copy: {}", some_integer);
}

fn gives_ownership() -> String {
    let some_string = String::from("returned string");
    some_string // 返回，所有权移动到调用者
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string // 返回，所有权移动回调用者
}

/// 借用（Borrowing）- 不转移所有权
pub fn borrowing_basics() {
    println!("\n=== 5. 借用（Borrowing）===");

    let s1 = String::from("hello");

    // & 创建引用，不获取所有权
    let len = calculate_length(&s1);

    println!("'{}' 的长度是 {}", s1, len); // ✅ s1 仍然可用
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s 离开作用域，但因为它不拥有所有权，所以什么也不会发生

/// 可变引用
pub fn mutable_references() {
    println!("\n=== 6. 可变引用 ===");

    let mut s = String::from("hello");

    // 可变引用
    change(&mut s);

    println!("s = {}", s); // "hello, world"
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}

/// 借用规则
pub fn borrowing_rules() {
    println!("\n=== 7. 借用规则 ===");

    let mut s = String::from("hello");

    // 规则1: 可以有多个不可变引用
    let r1 = &s;
    let r2 = &s;
    println!("r1 = {}, r2 = {}", r1, r2);
    // r1 和 r2 的作用域结束

    // 规则2: 只能有一个可变引用
    let r3 = &mut s;
    r3.push_str(" world");
    // let r4 = &mut s; // ❌ 不能同时有两个可变引用
    println!("r3 = {}", r3);

    // 规则3: 不能同时有可变和不可变引用
    let mut s2 = String::from("hello");
    let r1 = &s2; // 不可变引用
    let r2 = &s2; // 不可变引用
    println!("{} and {}", r1, r2);
    // r1 和 r2 不再使用

    let r3 = &mut s2; // ✅ 可变引用
    r3.push_str(" world");
    println!("{}", r3);
}

/// 非词法作用域生命周期 (NLL)
pub fn non_lexical_lifetimes() {
    println!("\n=== 8. 非词法作用域生命周期 (NLL) ===");

    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    // r1 和 r2 在这里最后一次使用，之后就失效了

    let r3 = &mut s; // ✅ 没问题！r1 和 r2 已经不再使用
    r3.push_str(" world");
    println!("{}", r3);
}

/// 悬垂引用（Dangling References）
pub fn dangling_reference_example() {
    println!("\n=== 9. 防止悬垂引用 ===");

    // 下面的代码会编译失败
    // let reference_to_nothing = dangle();

    // 正确的做法：返回所有权
    let s = no_dangle();
    println!("no_dangle: {}", s);
}

// fn dangle() -> &String { // ❌ 返回悬垂引用
//     let s = String::from("hello");
//     &s
// } // s 被释放，引用指向无效内存

fn no_dangle() -> String {
    let s = String::from("hello");
    s // 移动所有权出去
}

/// 切片（Slice）- 特殊的引用
pub fn slice_examples() {
    println!("\n=== 10. 切片（Slice）===");

    let s = String::from("hello world");

    // 字符串切片
    let hello = &s[0..5];  // 或 &s[..5]
    let world = &s[6..11]; // 或 &s[6..]
    let whole = &s[..];    // 整个字符串

    println!("hello: {}, world: {}, whole: {}", hello, world, whole);

    // 字符串字面量就是切片
    let s: &str = "hello"; // 类型是 &str

    // 数组切片
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3]; // [2, 3]
    println!("array slice: {:?}", slice);

    // 实用函数：获取第一个单词
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("first word: {}", word);
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}

/// 所有权与数据结构
pub fn ownership_with_structs() {
    println!("\n=== 11. 结构体中的所有权 ===");

    #[derive(Debug)]
    struct User {
        username: String,  // 拥有所有权
        email: String,     // 拥有所有权
        sign_in_count: u64,
        active: bool,
    }

    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    println!("user1: {:?}", user1);

    // 部分移动
    let email = user1.email; // email 被移动
    // println!("{}", user1.email); // ❌ 不能使用
    println!("username: {}", user1.username); // ✅ username 仍然可用
    println!("moved email: {}", email);
}

/// 运行所有示例
pub fn run_all_ownership_examples() {
    println!("\n");
    println!("╔════════════════════════════════════════╗");
    println!("║   Rust 所有权系统 - 完整示例          ║");
    println!("╚════════════════════════════════════════╝");

    basic_ownership();
    copy_vs_move();
    clone_example();
    functions_and_ownership();
    borrowing_basics();
    mutable_references();
    borrowing_rules();
    non_lexical_lifetimes();
    dangling_reference_example();
    slice_examples();
    ownership_with_structs();

    println!("\n=== 所有权示例完成 ===\n");
}
