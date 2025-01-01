fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
struct EStruct {
    e: i32,
}
fn main() {
    let condition = true;

    let number = if true { 5 } else { 6 };

    println!("The value of number is: {}", number);

    // 解构
    let (a, mut b): (bool, bool) = (true, false);
    // a = true,不可变; b = false，可变
    println!("a = {:?}, b = {:?}", a, b);
    b = true;
    assert_eq!(a, b);

    // 解构赋值 a,b 又重新赋值了
    let (a, b, c, d, e);

    (a, b) = (1, 2);
    // _ 代表匹配一个值，但是我们不关心具体的值是什么，因此没有使用一个变量名而是使用了 _
    [c, .., d, _] = [1, 2, 3, 4, 5];
    EStruct { e, .. } = EStruct { e: 5 };

    assert_eq!([1, 2, 1, 4, 5], [a, b, c, d, e]);

    // 变量遮蔽(shadowing)
    // 我认为和JS中的块级作用域一样
    let x = 5;
    // 在main函数的作用域内对之前的x进行遮蔽
    let x = x + 1;

    {
        // 在当前的花括号作用域内，对之前的x进行遮蔽
        let x = x * 2;
        println!("The value of x in the inner scope is: {}", x);
        let a = "{}"; // 块级作用域
    }
    // 同名变量可以不同类型
    let a = 1;
    let a = "22";

    println!("The value of x is: {}", x);

    println!("Hello, world!");

    let a = 1;

    // 类型
    let a: u8 = 255;
    let b = a.wrapping_add(20);
    println!("{}", b); // 19

    // 整数默认为i32，浮点默认为f64

    // 这个函数如果没使用，这个函数中引用的其他函数也会被标记为unused
    // main_ownership()

    main_reference()
}

fn add(x: u32, y: u32) -> u32 {
    x + y
    // x + y; 不能写分号
}

// 发散函数
fn dead_end() -> ! {
    panic!("你已经到了穷途末路，崩溃吧！");
}

fn forever() -> ! {
    loop {
        //...
    }
}
/**
 * 所有权
 * 赋值和引用
 */
fn main_ownership() {
    let s = String::from("hello"); // s 进入作用域

    takes_ownership(s); // s 的值移动到函数里 ...
                        // ... 所以到这里不再有效

    let x = 5; // x 进入作用域

    makes_copy(x); // x 应该移动函数里，
                   // 但 i32 是 Copy 的，所以在后面可继续使用 x
}
// 这里, x 先移出了作用域，然后是 s。但因为 s 的值已被移走，
// 所以不会有特殊操作

fn takes_ownership(some_string: String) {
    // some_string 进入作用域
    println!("{}", some_string);
} // 这里，some_string 移出作用域并调用 `drop` 方法。占用的内存被释放

fn makes_copy(some_integer: i32) {
    // some_integer 进入作用域
    println!("{}", some_integer);
} // 这里，some_integer 移出作用域。不会有特殊操作

// 引用
fn main_reference() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);

    let s1 = String::from("hello");

    // & 符号即是引用，它们允许你使用值，但是不获取所有权
    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);

    let mut s = String::from("hello");

    add_str(&mut s, " world");
    println!("{}", s);

    let mut s = String::from("hello");

    let r1 = &mut s;
    // let r2 = &mut s; cannot borrow `s` as mutable more than once at a time

    // ==
    let mut s = String::from("hello");

    {
        let r1 = &mut s;
    } // r1 在这里离开了作用域，所以我们完全可以创建一个新的引用

    // ==
    let mut s = String::from("hello");

    let r1 = &s; // 没问题
    let r2 = &s; // 没问题
    let r3 = "hello"; // &str;
    let r3 = String::from("hello"); // String

    // let r3 = &mut s; // 大问题

    let r2 = &mut s;
}
fn add_str(some_string: &mut String, other_string: &str) {
    some_string.push_str(other_string);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
