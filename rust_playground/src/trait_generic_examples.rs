// ============================================
// Rust Trait 和泛型 - 深度示例
// ============================================

use std::fmt::{Debug, Display};

/// Trait 基础
pub fn trait_basics() {
    println!("\n=== 1. Trait 基础 ===");

    // 定义 trait
    trait Summary {
        fn summarize(&self) -> String;
    }

    // 为类型实现 trait
    struct NewsArticle {
        headline: String,
        location: String,
        author: String,
        content: String,
    }

    impl Summary for NewsArticle {
        fn summarize(&self) -> String {
            format!("{}, by {} ({})", self.headline, self.author, self.location)
        }
    }

    struct Tweet {
        username: String,
        content: String,
        reply: bool,
        retweet: bool,
    }

    impl Summary for Tweet {
        fn summarize(&self) -> String {
            format!("{}: {}", self.username, self.content)
        }
    }

    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    };

    println!("1 new tweet: {}", tweet.summarize());

    let article = NewsArticle {
        headline: String::from("Penguins win the Stanley Cup Championship!"),
        location: String::from("Pittsburgh, PA, USA"),
        author: String::from("Iceburgh"),
        content: String::from("The Pittsburgh Penguins once again are the best hockey team in the NHL."),
    };

    println!("New article available! {}", article.summarize());
}

/// Trait 默认实现
pub fn trait_default_implementation() {
    println!("\n=== 2. Trait 默认实现 ===");

    trait Summary {
        fn summarize_author(&self) -> String;

        // 默认实现
        fn summarize(&self) -> String {
            format!("(Read more from {}...)", self.summarize_author())
        }
    }

    struct Tweet {
        username: String,
        content: String,
    }

    impl Summary for Tweet {
        fn summarize_author(&self) -> String {
            format!("@{}", self.username)
        }
        // 使用默认的 summarize 实现
    }

    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
    };

    println!("1 new tweet: {}", tweet.summarize());
}

/// Trait 作为参数
pub fn trait_as_parameter() {
    println!("\n=== 3. Trait 作为参数 ===");

    trait Summary {
        fn summarize(&self) -> String;
    }

    struct Article {
        title: String,
    }

    impl Summary for Article {
        fn summarize(&self) -> String {
            self.title.clone()
        }
    }

    // 方式1: impl Trait 语法
    fn notify1(item: &impl Summary) {
        println!("Breaking news! {}", item.summarize());
    }

    // 方式2: Trait bound 语法（更灵活）
    fn notify2<T: Summary>(item: &T) {
        println!("Breaking news! {}", item.summarize());
    }

    // 多个参数
    fn notify3(item1: &impl Summary, item2: &impl Summary) {
        println!("{} and {}", item1.summarize(), item2.summarize());
    }

    // 强制两个参数是同一类型
    fn notify4<T: Summary>(item1: &T, item2: &T) {
        println!("{} and {}", item1.summarize(), item2.summarize());
    }

    let article = Article {
        title: String::from("Rust is awesome"),
    };

    notify1(&article);
    notify2(&article);
}

/// 多个 Trait Bound
pub fn multiple_trait_bounds() {
    println!("\n=== 4. 多个 Trait Bound ===");

    // 使用 + 语法
    fn notify1(item: &(impl Summary + Display)) {
        println!("{}", item);
    }

    // 泛型版本
    fn notify2<T: Summary + Display>(item: &T) {
        println!("{}", item);
    }

    // where 子句让代码更清晰
    fn some_function<T, U>(t: &T, u: &U) -> i32
    where
        T: Display + Clone,
        U: Clone + Debug,
    {
        println!("t: {}", t);
        println!("u: {:?}", u);
        0
    }

    trait Summary {
        fn summarize(&self) -> String;
    }

    let x = 5;
    let y = String::from("hello");
    some_function(&x, &y);
}

/// 返回实现了 Trait 的类型
pub fn return_trait() {
    println!("\n=== 5. 返回实现了 Trait 的类型 ===");

    trait Summary {
        fn summarize(&self) -> String;
    }

    struct Tweet {
        content: String,
    }

    impl Summary for Tweet {
        fn summarize(&self) -> String {
            self.content.clone()
        }
    }

    // 返回 impl Trait
    fn returns_summarizable() -> impl Summary {
        Tweet {
            content: String::from("of course, as you probably already know, people"),
        }
    }

    let tweet = returns_summarizable();
    println!("Summary: {}", tweet.summarize());

    // 注意：不能根据条件返回不同类型
    // fn returns_summarizable_conditional(switch: bool) -> impl Summary {
    //     if switch {
    //         Tweet { ... }
    //     } else {
    //         NewsArticle { ... } // ❌ 错误！
    //     }
    // }
}

/// 使用 Trait Bound 有条件地实现方法
pub fn conditional_trait_implementation() {
    println!("\n=== 6. 条件实现 ===");

    struct Pair<T> {
        x: T,
        y: T,
    }

    impl<T> Pair<T> {
        fn new(x: T, y: T) -> Self {
            Self { x, y }
        }
    }

    // 只有当 T 实现了 Display + PartialOrd 时才实现 cmp_display
    impl<T: Display + PartialOrd> Pair<T> {
        fn cmp_display(&self) {
            if self.x >= self.y {
                println!("最大的是 x = {}", self.x);
            } else {
                println!("最大的是 y = {}", self.y);
            }
        }
    }

    let pair = Pair::new(10, 20);
    pair.cmp_display();
}

/// 泛型基础
pub fn generic_basics() {
    println!("\n=== 7. 泛型基础 ===");

    // 泛型函数
    fn largest<T: PartialOrd>(list: &[T]) -> &T {
        let mut largest = &list[0];
        for item in list {
            if item > largest {
                largest = item;
            }
        }
        largest
    }

    let number_list = vec![34, 50, 25, 100, 65];
    let result = largest(&number_list);
    println!("最大的数字是 {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];
    let result = largest(&char_list);
    println!("最大的字符是 {}", result);
}

/// 泛型结构体
pub fn generic_structs() {
    println!("\n=== 8. 泛型结构体 ===");

    // 单个泛型参数
    #[derive(Debug)]
    struct Point<T> {
        x: T,
        y: T,
    }

    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };

    println!("integer point: {:?}", integer);
    println!("float point: {:?}", float);

    // 多个泛型参数
    #[derive(Debug)]
    struct Point2<T, U> {
        x: T,
        y: U,
    }

    let both_integer = Point2 { x: 5, y: 10 };
    let both_float = Point2 { x: 1.0, y: 4.0 };
    let integer_and_float = Point2 { x: 5, y: 4.0 };

    println!("mixed point: {:?}", integer_and_float);
}

/// 泛型枚举
pub fn generic_enums() {
    println!("\n=== 9. 泛型枚举 ===");

    // Option 的定义
    // enum Option<T> {
    //     Some(T),
    //     None,
    // }

    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;

    println!("some_number: {:?}", some_number);
    println!("some_string: {:?}", some_string);
    println!("absent_number: {:?}", absent_number);

    // Result 的定义
    // enum Result<T, E> {
    //     Ok(T),
    //     Err(E),
    // }

    let success: Result<i32, String> = Ok(10);
    let failure: Result<i32, String> = Err(String::from("error"));

    println!("success: {:?}", success);
    println!("failure: {:?}", failure);
}

/// 泛型方法
pub fn generic_methods() {
    println!("\n=== 10. 泛型方法 ===");

    struct Point<T> {
        x: T,
        y: T,
    }

    // 为所有 T 实现方法
    impl<T> Point<T> {
        fn x(&self) -> &T {
            &self.x
        }
    }

    // 只为特定类型实现方法
    impl Point<f32> {
        fn distance_from_origin(&self) -> f32 {
            (self.x.powi(2) + self.y.powi(2)).sqrt()
        }
    }

    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());

    let p = Point { x: 3.0, y: 4.0 };
    println!("distance: {}", p.distance_from_origin());
}

/// 关联类型
pub fn associated_types() {
    println!("\n=== 11. 关联类型 ===");

    trait Iterator {
        type Item; // 关联类型

        fn next(&mut self) -> Option<Self::Item>;
    }

    struct Counter {
        count: u32,
    }

    impl Counter {
        fn new() -> Counter {
            Counter { count: 0 }
        }
    }

    impl Iterator for Counter {
        type Item = u32; // 指定关联类型

        fn next(&mut self) -> Option<Self::Item> {
            if self.count < 5 {
                self.count += 1;
                Some(self.count)
            } else {
                None
            }
        }
    }

    let mut counter = Counter::new();
    println!("counter.next(): {:?}", counter.next());
    println!("counter.next(): {:?}", counter.next());
}

/// 运算符重载
pub fn operator_overloading() {
    println!("\n=== 12. 运算符重载 ===");

    use std::ops::Add;

    #[derive(Debug, Copy, Clone, PartialEq)]
    struct Point {
        x: i32,
        y: i32,
    }

    impl Add for Point {
        type Output = Point;

        fn add(self, other: Point) -> Point {
            Point {
                x: self.x + other.x,
                y: self.y + other.y,
            }
        }
    }

    let p1 = Point { x: 1, y: 0 };
    let p2 = Point { x: 2, y: 3 };
    let p3 = p1 + p2;

    println!("{:?} + {:?} = {:?}", p1, p2, p3);
}

/// 完全限定语法
pub fn fully_qualified_syntax() {
    println!("\n=== 13. 完全限定语法 ===");

    trait Pilot {
        fn fly(&self);
    }

    trait Wizard {
        fn fly(&self);
    }

    struct Human;

    impl Pilot for Human {
        fn fly(&self) {
            println!("This is your captain speaking.");
        }
    }

    impl Wizard for Human {
        fn fly(&self) {
            println!("Up!");
        }
    }

    impl Human {
        fn fly(&self) {
            println!("*waving arms furiously*");
        }
    }

    let person = Human;
    Pilot::fly(&person);  // 调用 Pilot trait 的方法
    Wizard::fly(&person); // 调用 Wizard trait 的方法
    person.fly();         // 调用 Human 的方法
}

/// Supertrait（父 Trait）
pub fn supertraits() {
    println!("\n=== 14. Supertrait ===");

    use std::fmt;

    // OutlinePrint 依赖 Display
    trait OutlinePrint: fmt::Display {
        fn outline_print(&self) {
            let output = self.to_string();
            let len = output.len();
            println!("{}", "*".repeat(len + 4));
            println!("*{}*", " ".repeat(len + 2));
            println!("* {} *", output);
            println!("*{}*", " ".repeat(len + 2));
            println!("{}", "*".repeat(len + 4));
        }
    }

    struct Point {
        x: i32,
        y: i32,
    }

    impl fmt::Display for Point {
        fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
            write!(f, "({}, {})", self.x, self.y)
        }
    }

    impl OutlinePrint for Point {}

    let p = Point { x: 1, y: 3 };
    p.outline_print();
}

/// Newtype 模式
pub fn newtype_pattern() {
    println!("\n=== 15. Newtype 模式 ===");

    use std::fmt;

    // 为外部类型实现外部 trait（绕过孤儿规则）
    struct Wrapper(Vec<String>);

    impl fmt::Display for Wrapper {
        fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
            write!(f, "[{}]", self.0.join(", "))
        }
    }

    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}

/// 运行所有示例
pub fn run_all_trait_generic_examples() {
    println!("\n");
    println!("╔════════════════════════════════════════╗");
    println!("║   Rust Trait 和泛型 - 完整示例        ║");
    println!("╚════════════════════════════════════════╝");

    trait_basics();
    trait_default_implementation();
    trait_as_parameter();
    multiple_trait_bounds();
    return_trait();
    conditional_trait_implementation();
    generic_basics();
    generic_structs();
    generic_enums();
    generic_methods();
    associated_types();
    operator_overloading();
    fully_qualified_syntax();
    supertraits();
    newtype_pattern();

    println!("\n=== Trait 和泛型示例完成 ===\n");
}
