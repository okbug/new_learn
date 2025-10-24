// ============================================
// Rust 智能指针 - 深度示例
// ============================================

use std::rc::Rc;
use std::cell::RefCell;
use std::ops::Deref;

/// Box<T> - 堆分配
pub fn box_basics() {
    println!("\n=== 1. Box<T> 基础 ===");

    // 在堆上存储数据
    let b = Box::new(5);
    println!("b = {}", b);

    // Box 的主要用途：
    // 1. 当有一个在编译时未知大小的类型
    // 2. 当有大量数据并希望转移所有权但确保数据不被拷贝
    // 3. 当希望拥有一个值并只关心它实现了特定 trait

    // 用途1: 递归类型
    #[derive(Debug)]
    enum List {
        Cons(i32, Box<List>),
        Nil,
    }

    use List::{Cons, Nil};

    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("list: {:?}", list);

    // 用途2: 避免栈溢出
    let large_data = Box::new([0; 1_000_000]); // 1MB 的数据在堆上
    println!("大数据已分配在堆上，长度: {}", large_data.len());
}

/// Deref trait - 解引用
pub fn deref_trait() {
    println!("\n=== 2. Deref Trait ===");

    // Box 实现了 Deref，可以像引用一样使用
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y); // 解引用 Box

    println!("*y = {}", *y);

    // 自定义智能指针
    struct MyBox<T>(T);

    impl<T> MyBox<T> {
        fn new(x: T) -> MyBox<T> {
            MyBox(x)
        }
    }

    impl<T> Deref for MyBox<T> {
        type Target = T;

        fn deref(&self) -> &Self::Target {
            &self.0
        }
    }

    let y = MyBox::new(x);
    assert_eq!(5, *y); // 现在可以解引用了
    println!("MyBox: *y = {}", *y);
}

/// Deref 强制转换
pub fn deref_coercion() {
    println!("\n=== 3. Deref 强制转换 ===");

    fn hello(name: &str) {
        println!("Hello, {}!", name);
    }

    let m = Box::new(String::from("Rust"));

    // Deref 强制转换：
    // &Box<String> -> &String -> &str
    hello(&m);

    // 没有 deref 强制转换的话：
    hello(&(*m)[..]);
}

/// Drop trait - 清理代码
pub fn drop_trait() {
    println!("\n=== 4. Drop Trait ===");

    struct CustomSmartPointer {
        data: String,
    }

    impl Drop for CustomSmartPointer {
        fn drop(&mut self) {
            println!("释放 CustomSmartPointer: `{}`!", self.data);
        }
    }

    {
        let c = CustomSmartPointer {
            data: String::from("my stuff"),
        };
        let d = CustomSmartPointer {
            data: String::from("other stuff"),
        };
        println!("CustomSmartPointers 已创建");
    } // c 和 d 离开作用域，drop 被调用

    println!("作用域结束");

    // 提前释放值
    let c = CustomSmartPointer {
        data: String::from("some data"),
    };
    println!("CustomSmartPointer 已创建");
    drop(c); // 显式调用 drop
    println!("CustomSmartPointer 已在作用域结束前释放");
}

/// Rc<T> - 引用计数
pub fn rc_basics() {
    println!("\n=== 5. Rc<T> 引用计数智能指针 ===");

    #[derive(Debug)]
    enum List {
        Cons(i32, Rc<List>),
        Nil,
    }

    use List::{Cons, Nil};

    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    println!("创建 a 后引用计数 = {}", Rc::strong_count(&a));

    let b = Cons(3, Rc::clone(&a)); // 增加引用计数
    println!("创建 b 后引用计数 = {}", Rc::strong_count(&a));

    {
        let c = Cons(4, Rc::clone(&a)); // 增加引用计数
        println!("创建 c 后引用计数 = {}", Rc::strong_count(&a));
    } // c 离开作用域，引用计数减1

    println!("c 离开作用域后引用计数 = {}", Rc::strong_count(&a));

    // Rc 只能用于单线程场景
    // Rc 只允许不可变引用
}

/// RefCell<T> - 内部可变性
pub fn refcell_basics() {
    println!("\n=== 6. RefCell<T> 内部可变性 ===");

    // 借用规则：
    // - 编译时检查 vs 运行时检查
    // - Box<T>: 编译时检查
    // - RefCell<T>: 运行时检查

    let x = RefCell::new(5);

    // 不可变借用
    let a = x.borrow();
    println!("a = {}", a);
    drop(a); // 释放借用

    // 可变借用
    *x.borrow_mut() += 10;
    println!("x after mutation = {}", x.borrow());

    // 演示运行时借用检查
    let y = RefCell::new(5);
    let _a = y.borrow();
    // let _b = y.borrow_mut(); // ⚠️  运行时 panic！不能同时有可变和不可变借用
}

/// Rc<T> + RefCell<T> 组合
pub fn rc_refcell_combination() {
    println!("\n=== 7. Rc<RefCell<T>> 组合使用 ===");

    #[derive(Debug)]
    enum List {
        Cons(Rc<RefCell<i32>>, Rc<List>),
        Nil,
    }

    use List::{Cons, Nil};

    let value = Rc::new(RefCell::new(5));

    let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));
    let b = Cons(Rc::new(RefCell::new(3)), Rc::clone(&a));
    let c = Cons(Rc::new(RefCell::new(4)), Rc::clone(&a));

    println!("修改前:");
    println!("a = {:?}", a);
    println!("b = {:?}", b);
    println!("c = {:?}", c);

    // 修改共享值
    *value.borrow_mut() += 10;

    println!("\n修改后:");
    println!("a = {:?}", a);
    println!("b = {:?}", b);
    println!("c = {:?}", c);
}

/// 内部可变性模式
pub fn interior_mutability_pattern() {
    println!("\n=== 8. 内部可变性模式 ===");

    // Mock 对象示例
    trait Messenger {
        fn send(&self, msg: &str);
    }

    struct LimitTracker<'a, T: Messenger> {
        messenger: &'a T,
        value: usize,
        max: usize,
    }

    impl<'a, T> LimitTracker<'a, T>
    where
        T: Messenger,
    {
        fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
            LimitTracker {
                messenger,
                value: 0,
                max,
            }
        }

        fn set_value(&mut self, value: usize) {
            self.value = value;

            let percentage_of_max = self.value as f64 / self.max as f64;

            if percentage_of_max >= 1.0 {
                self.messenger.send("Error: 已超过配额！");
            } else if percentage_of_max >= 0.9 {
                self.messenger.send("警告: 已使用 90% 配额！");
            } else if percentage_of_max >= 0.75 {
                self.messenger.send("警告: 已使用 75% 配额！");
            }
        }
    }

    // 使用 RefCell 的 Mock
    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: RefCell::new(vec![]),
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            // 即使 &self 是不可变的，也可以修改内部数据
            self.sent_messages.borrow_mut().push(String::from(message));
        }
    }

    let mock_messenger = MockMessenger::new();
    let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

    limit_tracker.set_value(80);

    println!("发送的消息: {:?}", mock_messenger.sent_messages.borrow());
}

/// 引用循环和内存泄漏
pub fn reference_cycles() {
    println!("\n=== 9. 引用循环（内存泄漏）===");

    #[derive(Debug)]
    enum List {
        Cons(i32, RefCell<Rc<List>>),
        Nil,
    }

    use List::{Cons, Nil};

    impl List {
        fn tail(&self) -> Option<&RefCell<Rc<List>>> {
            match self {
                Cons(_, item) => Some(item),
                Nil => None,
            }
        }
    }

    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));
    println!("a 初始引用计数 = {}", Rc::strong_count(&a));

    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));
    println!("创建 b 后 a 引用计数 = {}", Rc::strong_count(&a));
    println!("b 初始引用计数 = {}", Rc::strong_count(&b));

    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("创建循环后 b 引用计数 = {}", Rc::strong_count(&b));
    println!("创建循环后 a 引用计数 = {}", Rc::strong_count(&a));

    // ⚠️ 如果取消注释会导致栈溢出
    // println!("a next item = {:?}", a.tail());
}

/// Weak<T> - 弱引用
pub fn weak_references() {
    println!("\n=== 10. Weak<T> 弱引用 ===");

    use std::rc::Weak;

    #[derive(Debug)]
    struct Node {
        value: i32,
        parent: RefCell<Weak<Node>>,
        children: RefCell<Vec<Rc<Node>>>,
    }

    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!("leaf strong = {}, weak = {}",
             Rc::strong_count(&leaf),
             Rc::weak_count(&leaf));

    {
        let branch = Rc::new(Node {
            value: 5,
            parent: RefCell::new(Weak::new()),
            children: RefCell::new(vec![Rc::clone(&leaf)]),
        });

        *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

        println!("branch strong = {}, weak = {}",
                 Rc::strong_count(&branch),
                 Rc::weak_count(&branch));

        println!("leaf strong = {}, weak = {}",
                 Rc::strong_count(&leaf),
                 Rc::weak_count(&leaf));
    }

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
    println!("leaf strong = {}, weak = {}",
             Rc::strong_count(&leaf),
             Rc::weak_count(&leaf));
}

/// 智能指针选择指南
pub fn smart_pointer_guide() {
    println!("\n=== 11. 智能指针选择指南 ===");

    println!("\n📦 Box<T>:");
    println!("  ✓ 在堆上分配值");
    println!("  ✓ 递归类型");
    println!("  ✓ 大量数据的所有权转移");
    println!("  ✓ trait 对象");

    println!("\n📊 Rc<T>:");
    println!("  ✓ 多个所有者（单线程）");
    println!("  ✓ 只读数据共享");
    println!("  ✗ 不可变引用");

    println!("\n🔄 RefCell<T>:");
    println!("  ✓ 运行时借用检查");
    println!("  ✓ 内部可变性");
    println!("  ✓ 单线程场景");
    println!("  ⚠️  运行时 panic 风险");

    println!("\n🔗 Rc<RefCell<T>>:");
    println!("  ✓ 多个所有者 + 可变性");
    println!("  ✓ 单线程复杂数据结构");

    println!("\n🪶 Weak<T>:");
    println!("  ✓ 避免引用循环");
    println!("  ✓ 父子关系");
    println!("  ✓ 缓存");

    println!("\n🧵 Arc<T> + Mutex<T>:");
    println!("  ✓ 多线程多个所有者");
    println!("  ✓ 线程间共享可变数据");
    println!("  📝 参见并发示例");
}

/// 实用示例：树形数据结构
pub fn tree_example() {
    println!("\n=== 12. 实用示例：树形结构 ===");

    use std::rc::Weak;

    #[derive(Debug)]
    struct TreeNode {
        value: i32,
        parent: RefCell<Weak<TreeNode>>,
        children: RefCell<Vec<Rc<TreeNode>>>,
    }

    impl TreeNode {
        fn new(value: i32) -> Rc<TreeNode> {
            Rc::new(TreeNode {
                value,
                parent: RefCell::new(Weak::new()),
                children: RefCell::new(vec![]),
            })
        }

        fn add_child(parent: &Rc<TreeNode>, child: Rc<TreeNode>) {
            *child.parent.borrow_mut() = Rc::downgrade(parent);
            parent.children.borrow_mut().push(child);
        }
    }

    let root = TreeNode::new(1);
    let child1 = TreeNode::new(2);
    let child2 = TreeNode::new(3);

    TreeNode::add_child(&root, child1);
    TreeNode::add_child(&root, child2);

    println!("根节点: {:?}", root.value);
    println!("子节点数量: {}", root.children.borrow().len());
}

/// 运行所有示例
pub fn run_all_smart_pointer_examples() {
    println!("\n");
    println!("╔════════════════════════════════════════╗");
    println!("║   Rust 智能指针 - 完整示例            ║");
    println!("╚════════════════════════════════════════╝");

    box_basics();
    deref_trait();
    deref_coercion();
    drop_trait();
    rc_basics();
    refcell_basics();
    rc_refcell_combination();
    interior_mutability_pattern();
    reference_cycles();
    weak_references();
    smart_pointer_guide();
    tree_example();

    println!("\n=== 智能指针示例完成 ===\n");
}
