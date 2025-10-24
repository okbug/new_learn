// ============================================
// Rust 生命周期 - 深度示例
// ============================================

/// 生命周期基础
pub fn lifetime_basics() {
    println!("\n=== 1. 为什么需要生命周期 ===");

    // 编译器需要确保引用总是有效的
    let r;
    {
        let x = 5;
        r = &x; // ❌ x 在这个作用域结束后被释放
    }
    // println!("r: {}", r); // ❌ 悬垂引用！

    // 正确的做法
    let x = 5;
    let r = &x;
    println!("r: {}", r); // ✅ x 在 r 使用时仍然有效
}

/// 函数中的生命周期标注
pub fn lifetime_annotations() {
    println!("\n=== 2. 生命周期标注语法 ===");

    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("最长的字符串是: {}", result);
    }
    // println!("结果: {}", result); // ❌ 如果取消注释会报错
}

// 生命周期标注语法
// 'a 读作 "lifetime a"
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

// 这告诉 Rust：返回的引用的生命周期
// 与参数中生命周期较短的那个相同

/// 生命周期标注详解
pub fn lifetime_annotation_details() {
    println!("\n=== 3. 生命周期标注详解 ===");

    // 示例1: 返回的引用与 x 相关
    fn first<'a>(x: &'a str, _y: &str) -> &'a str {
        x
    }

    let s1 = String::from("hello");
    let s2 = String::from("world");
    let result = first(&s1, &s2);
    println!("first: {}", result);

    // 示例2: 不同的生命周期参数
    fn different_lifetimes<'a, 'b>(x: &'a str, y: &'b str) -> &'a str {
        println!("x: {}, y: {}", x, y);
        x // 只返回 x，所以只需要 'a
    }

    let result = different_lifetimes(&s1, &s2);
    println!("different_lifetimes: {}", result);
}

/// 结构体中的生命周期
pub fn struct_lifetimes() {
    println!("\n=== 4. 结构体中的生命周期 ===");

    // 结构体持有引用，需要生命周期标注
    #[derive(Debug)]
    struct ImportantExcerpt<'a> {
        part: &'a str,
    }

    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");

    let i = ImportantExcerpt {
        part: first_sentence,
    };

    println!("ImportantExcerpt: {:?}", i);
    // i 的生命周期不能超过 novel
}

/// 生命周期省略规则
pub fn lifetime_elision() {
    println!("\n=== 5. 生命周期省略规则 ===");

    // 规则1: 每个引用参数都有自己的生命周期
    fn print_str(s: &str) { // 等价于 fn print_str<'a>(s: &'a str)
        println!("{}", s);
    }

    // 规则2: 如果只有一个输入生命周期参数，
    // 它被赋予所有输出生命周期参数
    fn first_word(s: &str) -> &str { // 等价于 <'a>(s: &'a str) -> &'a str
        s.split_whitespace().next().unwrap_or("")
    }

    // 规则3: 如果有多个输入生命周期参数，
    // 但其中一个是 &self 或 &mut self（方法），
    // self 的生命周期被赋予所有输出生命周期参数

    print_str("hello");
    let result = first_word("hello world");
    println!("first_word: {}", result);
}

/// 方法中的生命周期
pub fn method_lifetimes() {
    println!("\n=== 6. 方法中的生命周期 ===");

    struct ImportantExcerpt<'a> {
        part: &'a str,
    }

    impl<'a> ImportantExcerpt<'a> {
        // 生命周期省略规则应用
        fn level(&self) -> i32 {
            3
        }

        // 返回引用，应用规则3
        fn announce_and_return_part(&self, announcement: &str) -> &str {
            println!("Attention please: {}", announcement);
            self.part
        }

        // 明确的生命周期标注
        fn announce_and_return_param<'b>(&self, announcement: &'b str) -> &'b str {
            println!("Attention: {}", announcement);
            announcement
        }
    }

    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let excerpt = ImportantExcerpt {
        part: first_sentence,
    };

    println!("Level: {}", excerpt.level());
    let announcement = String::from("Breaking news!");
    excerpt.announce_and_return_part(&announcement);
}

/// 静态生命周期
pub fn static_lifetime() {
    println!("\n=== 7. 静态生命周期 'static ===");

    // 'static 表示引用在整个程序运行期间都有效
    let s: &'static str = "I have a static lifetime.";
    println!("{}", s);

    // 字符串字面量都是 'static
    let s1: &'static str = "hello";
    let s2 = "world"; // 类型推断为 &'static str

    println!("{} {}", s1, s2);

    // 警告：不要随意使用 'static
    // 大多数情况下，你不需要 'static
}

/// 生命周期、泛型和 trait bound 结合
pub fn lifetime_generic_trait() {
    println!("\n=== 8. 生命周期 + 泛型 + Trait Bound ===");

    use std::fmt::Display;

    // 结合所有概念的函数签名
    fn longest_with_an_announcement<'a, T>(
        x: &'a str,
        y: &'a str,
        ann: T,
    ) -> &'a str
    where
        T: Display,
    {
        println!("Announcement! {}", ann);
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }

    let string1 = String::from("long string");
    let string2 = String::from("short");
    let result = longest_with_an_announcement(
        string1.as_str(),
        string2.as_str(),
        "Today is someone's birthday!",
    );
    println!("最长的字符串是: {}", result);
}

/// 复杂的生命周期场景
pub fn complex_lifetime_scenarios() {
    println!("\n=== 9. 复杂的生命周期场景 ===");

    // 场景1: 结构体包含多个引用
    #[derive(Debug)]
    struct Context<'a, 'b> {
        s: &'a str,
        t: &'b str,
    }

    let s = String::from("hello");
    let t = String::from("world");
    let ctx = Context {
        s: &s,
        t: &t,
    };
    println!("Context: {:?}", ctx);

    // 场景2: 生命周期约束
    struct Parser<'a, 'b: 'a> { // 'b: 'a 表示 'b 至少要和 'a 一样长
        current: &'a str,
        remaining: &'b str,
    }

    // 场景3: 返回引用到结构体字段
    struct StringHolder {
        data: String,
    }

    impl StringHolder {
        fn get_data(&self) -> &str {
            &self.data
        }
    }

    let holder = StringHolder {
        data: String::from("data"),
    };
    let data_ref = holder.get_data();
    println!("StringHolder data: {}", data_ref);
}

/// 生命周期子类型化
pub fn lifetime_subtyping() {
    println!("\n=== 10. 生命周期子类型化 ===");

    // 'static 是所有生命周期的子类型
    fn print_it<'a>(input: &'a str) {
        println!("{}", input);
    }

    let static_str: &'static str = "I'm static";
    print_it(static_str); // 'static 可以作为任何 'a 使用

    // 生命周期协变（covariance）
    fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
        if x.len() > y.len() { x } else { y }
    }

    let string1 = String::from("long");
    let result;
    {
        let string2 = String::from("short");
        result = longest(&string1, &string2);
        println!("最长的: {}", result);
    }
}

/// 常见的生命周期错误和解决方案
pub fn common_lifetime_errors() {
    println!("\n=== 11. 常见生命周期错误 ===");

    println!("错误1: 返回悬垂引用");
    // fn dangle() -> &str { // ❌ 缺少生命周期参数
    //     let s = String::from("hello");
    //     &s
    // } // s 被释放

    // 解决方案：返回所有权
    fn no_dangle() -> String {
        String::from("hello")
    }
    println!("no_dangle: {}", no_dangle());

    println!("\n错误2: 生命周期不够长");
    // let r;
    // {
    //     let x = 5;
    //     r = &x; // ❌ x 的生命周期不够长
    // }
    // println!("{}", r);

    // 解决方案：扩大 x 的作用域
    let x = 5;
    let r = &x;
    println!("r: {}", r);
}

/// 实用技巧和最佳实践
pub fn lifetime_best_practices() {
    println!("\n=== 12. 生命周期最佳实践 ===");

    println!("✅ 1. 尽可能依赖生命周期省略规则");
    println!("✅ 2. 只在必要时显式标注生命周期");
    println!("✅ 3. 考虑返回所有权而不是引用");
    println!("✅ 4. 使用 'static 要慎重");
    println!("✅ 5. 结构体中存储引用要慎重，考虑存储所有权");

    // 示例：避免生命周期，使用所有权
    #[derive(Debug)]
    struct BetterExcerpt {
        part: String, // 拥有数据，不需要生命周期标注
    }

    let excerpt = BetterExcerpt {
        part: String::from("Call me Ishmael"),
    };
    println!("BetterExcerpt: {:?}", excerpt);
}

/// 运行所有示例
pub fn run_all_lifetime_examples() {
    println!("\n");
    println!("╔════════════════════════════════════════╗");
    println!("║   Rust 生命周期 - 完整示例            ║");
    println!("╚════════════════════════════════════════╝");

    lifetime_basics();
    lifetime_annotations();
    lifetime_annotation_details();
    struct_lifetimes();
    lifetime_elision();
    method_lifetimes();
    static_lifetime();
    lifetime_generic_trait();
    complex_lifetime_scenarios();
    lifetime_subtyping();
    common_lifetime_errors();
    lifetime_best_practices();

    println!("\n=== 生命周期示例完成 ===\n");
}
