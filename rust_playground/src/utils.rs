// 工具模块 - 用于演示模块间的相互导入

// 从 example 模块导入函数（演示循环导入的替代方案）
// 注意：Rust 不允许真正的循环依赖，但我们可以通过公共接口来实现协作

/// 加法函数
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// 乘法函数
pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

/// 减法函数
pub fn subtract(a: i32, b: i32) -> i32 {
    a - b
}

/// 除法函数（返回 Option 处理除零情况）
pub fn divide(a: i32, b: i32) -> Option<f64> {
    if b == 0 {
        None
    } else {
        Some(a as f64 / b as f64)
    }
}

/// 问候函数
pub fn greet(name: &str) -> String {
    format!("你好, {}! 欢迎学习 Rust!", name)
}

/// 计算阶乘
pub fn factorial(n: u32) -> u64 {
    if n == 0 {
        1
    } else {
        (1..=n as u64).product()
    }
}

/// 判断是否为质数
pub fn is_prime(n: u32) -> bool {
    if n <= 1 {
        return false;
    }
    if n <= 3 {
        return true;
    }
    if n % 2 == 0 || n % 3 == 0 {
        return false;
    }

    let mut i = 5;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 {
            return false;
        }
        i += 6;
    }
    true
}

/// 字符串工具
pub mod string_utils {
    /// 反转字符串
    pub fn reverse(s: &str) -> String {
        s.chars().rev().collect()
    }

    /// 转换为大写
    pub fn to_uppercase(s: &str) -> String {
        s.to_uppercase()
    }

    /// 统计单词数
    pub fn word_count(s: &str) -> usize {
        s.split_whitespace().count()
    }
}

/// 数学工具
pub mod math_utils {
    /// 计算平均值
    pub fn average(numbers: &[i32]) -> f64 {
        if numbers.is_empty() {
            return 0.0;
        }
        let sum: i32 = numbers.iter().sum();
        sum as f64 / numbers.len() as f64
    }

    /// 找出最大值
    pub fn max(numbers: &[i32]) -> Option<i32> {
        numbers.iter().max().copied()
    }

    /// 找出最小值
    pub fn min(numbers: &[i32]) -> Option<i32> {
        numbers.iter().min().copied()
    }
}

/// 演示如何使用这些工具函数
pub fn demo_utils() {
    println!("\n=== Utils 模块演示 ===");

    println!("10 + 5 = {}", add(10, 5));
    println!("10 * 5 = {}", multiply(10, 5));
    println!("10 - 5 = {}", subtract(10, 5));

    match divide(10, 5) {
        Some(result) => println!("10 / 5 = {}", result),
        None => println!("除数不能为零"),
    }

    println!("{}", greet("学习者"));
    println!("5! = {}", factorial(5));
    println!("17 是质数吗? {}", is_prime(17));

    // 字符串工具
    let text = "Hello Rust";
    println!("反转 '{}': {}", text, string_utils::reverse(text));
    println!("大写: {}", string_utils::to_uppercase(text));
    println!("'{}' 有 {} 个单词", text, string_utils::word_count(text));

    // 数学工具
    let numbers = vec![1, 5, 3, 9, 2, 7];
    println!("数组 {:?}", numbers);
    println!("平均值: {}", math_utils::average(&numbers));
    println!("最大值: {:?}", math_utils::max(&numbers));
    println!("最小值: {:?}", math_utils::min(&numbers));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_multiply() {
        assert_eq!(multiply(4, 5), 20);
    }

    #[test]
    fn test_is_prime() {
        assert!(is_prime(17));
        assert!(!is_prime(4));
    }
}
