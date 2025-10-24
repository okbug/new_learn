// ============================================
// Rust 并发编程 - 深度示例
// ============================================

use std::thread;
use std::time::Duration;
use std::sync::{Arc, Mutex, mpsc};

/// 创建线程基础
pub fn basic_threads() {
    println!("\n=== 1. 创建线程基础 ===");

    // 创建新线程
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    // 主线程
    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }

    // 等待线程完成
    handle.join().unwrap();
    println!("所有线程完成");
}

/// 使用 move 闭包
pub fn move_closures() {
    println!("\n=== 2. 使用 move 闭包 ===");

    let v = vec![1, 2, 3];

    // move 关键字强制闭包获取所有权
    let handle = thread::spawn(move || {
        println!("vector from thread: {:?}", v);
    });

    // println!("v: {:?}", v); // ❌ v 已被移动

    handle.join().unwrap();
}

/// 消息传递 - Channel
pub fn message_passing() {
    println!("\n=== 3. 消息传递 - Channel ===");

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
        // println!("{}", val); // ❌ val 已被移动
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}

/// 发送多个值
pub fn multiple_messages() {
    println!("\n=== 4. 发送多个值 ===");

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    // rx 作为迭代器
    for received in rx {
        println!("Got: {}", received);
    }
}

/// 多个生产者
pub fn multiple_producers() {
    println!("\n=== 5. 多个生产者 ===");

    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}

/// 共享状态 - Mutex
pub fn mutex_basics() {
    println!("\n=== 6. Mutex 互斥锁基础 ===");

    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;
    } // 锁在这里自动释放

    println!("m = {:?}", m);
}

/// 多线程共享 Mutex - Arc
pub fn arc_mutex() {
    println!("\n=== 7. Arc<Mutex<T>> 多线程共享 ===");

    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}

/// RefCell 与 Mutex 的相似性
pub fn refcell_vs_mutex() {
    println!("\n=== 8. RefCell vs Mutex ===");

    println!("RefCell<T>:");
    println!("  - 单线程");
    println!("  - 运行时借用检查");
    println!("  - Panic 如果违反借用规则");

    println!("\nMutex<T>:");
    println!("  - 多线程");
    println!("  - 运行时获取锁");
    println!("  - 可能死锁");
}

/// 死锁示例（注释掉以防真的死锁）
pub fn deadlock_example() {
    println!("\n=== 9. 死锁警告 ===");

    println!("⚠️  常见死锁场景：");
    println!("1. 多个锁的获取顺序不一致");
    println!("2. 持有锁时等待另一个锁");
    println!("3. 忘记释放锁");

    // 演示代码（不会真的死锁）
    let lock1 = Arc::new(Mutex::new(0));
    let lock2 = Arc::new(Mutex::new(0));

    let l1 = Arc::clone(&lock1);
    let l2 = Arc::clone(&lock2);

    let handle1 = thread::spawn(move || {
        let _g1 = l1.lock().unwrap();
        thread::sleep(Duration::from_millis(10));
        // 如果取消注释下面这行会导致死锁
        // let _g2 = l2.lock().unwrap();
    });

    let l1 = Arc::clone(&lock1);
    let l2 = Arc::clone(&lock2);

    let handle2 = thread::spawn(move || {
        let _g2 = l2.lock().unwrap();
        thread::sleep(Duration::from_millis(10));
        // 如果取消注释下面这行会导致死锁
        // let _g1 = l1.lock().unwrap();
    });

    handle1.join().unwrap();
    handle2.join().unwrap();

    println!("✅ 避免了死锁");
}

/// Send 和 Sync trait
pub fn send_sync_traits() {
    println!("\n=== 10. Send 和 Sync Trait ===");

    println!("\n📤 Send Trait:");
    println!("  - 允许在线程间转移所有权");
    println!("  - 大多数类型都实现了 Send");
    println!("  - Rc<T> 没有实现 Send");

    println!("\n🔄 Sync Trait:");
    println!("  - 允许多线程同时访问");
    println!("  - &T 是 Sync 的，如果 T 是 Sync");
    println!("  - RefCell<T> 和 Cell<T> 不是 Sync");
    println!("  - Mutex<T> 是 Sync");

    println!("\n完全由 Send 和 Sync 类型组成的类型也自动实现 Send 和 Sync");
}

/// 实用示例：并行计算
pub fn parallel_computation() {
    println!("\n=== 11. 实用示例：并行计算 ===");

    let data = Arc::new(vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let result = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    let chunk_size = 2;
    for i in 0..(data.len() / chunk_size) {
        let data = Arc::clone(&data);
        let result = Arc::clone(&result);

        let handle = thread::spawn(move || {
            let start = i * chunk_size;
            let end = start + chunk_size;
            let sum: i32 = data[start..end].iter().sum();

            let mut total = result.lock().unwrap();
            *total += sum;
        });

        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("总和: {}", *result.lock().unwrap());
}

/// 实用示例：生产者-消费者模式
pub fn producer_consumer() {
    println!("\n=== 12. 实用示例：生产者-消费者 ===");

    let (tx, rx) = mpsc::channel();

    // 生产者
    let producer = thread::spawn(move || {
        for i in 0..10 {
            println!("生产者: 生产 {}", i);
            tx.send(i).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    // 消费者
    let consumer = thread::spawn(move || {
        for received in rx {
            println!("消费者: 消费 {}", received);
            thread::sleep(Duration::from_millis(200));
        }
    });

    producer.join().unwrap();
    consumer.join().unwrap();
}

/// 实用示例：线程池概念
pub fn thread_pool_concept() {
    println!("\n=== 13. 线程池概念 ===");

    println!("线程池的优势：");
    println!("  ✓ 避免频繁创建/销毁线程的开销");
    println!("  ✓ 限制并发线程数量");
    println!("  ✓ 任务队列管理");

    println!("\n简单的工作线程示例：");

    let (tx, rx) = mpsc::channel();
    let rx = Arc::new(Mutex::new(rx));

    // 创建 4 个工作线程
    for id in 0..4 {
        let rx = Arc::clone(&rx);
        thread::spawn(move || {
            loop {
                let job = rx.lock().unwrap().recv();
                match job {
                    Ok(job) => {
                        println!("Worker {} got job: {}", id, job);
                        thread::sleep(Duration::from_millis(100));
                    }
                    Err(_) => break,
                }
            }
        });
    }

    // 发送任务
    for i in 0..10 {
        tx.send(i).unwrap();
    }

    thread::sleep(Duration::from_secs(2));
    println!("所有任务完成");
}

/// Barrier - 同步屏障
pub fn barrier_example() {
    println!("\n=== 14. Barrier 同步屏障 ===");

    use std::sync::Barrier;

    let mut handles = vec![];
    let barrier = Arc::new(Barrier::new(5));

    for i in 0..5 {
        let c = Arc::clone(&barrier);
        handles.push(thread::spawn(move || {
            println!("线程 {} 开始工作", i);
            thread::sleep(Duration::from_millis(100 * i as u64));
            println!("线程 {} 到达屏障", i);
            c.wait();
            println!("线程 {} 继续执行", i);
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }
}

/// 并发最佳实践
pub fn concurrency_best_practices() {
    println!("\n=== 15. 并发编程最佳实践 ===");

    println!("\n✅ 推荐做法:");
    println!("1. 优先使用消息传递而非共享内存");
    println!("2. 使用 Arc<Mutex<T>> 共享可变状态");
    println!("3. 保持临界区尽可能小");
    println!("4. 避免嵌套锁以防死锁");
    println!("5. 使用 RAII 确保锁被释放");

    println!("\n❌ 避免:");
    println!("1. 在持有锁时执行耗时操作");
    println!("2. 使用 Rc<T> 跨线程（用 Arc<T>）");
    println!("3. 忘记 join 重要的线程");
    println!("4. 过度使用共享状态");

    println!("\n📦 工具选择:");
    println!("  - 所有权转移: 直接 move");
    println!("  - 消息传递: mpsc::channel");
    println!("  - 共享只读: Arc<T>");
    println!("  - 共享可变: Arc<Mutex<T>>");
    println!("  - 原子操作: std::sync::atomic");
}

/// 运行所有示例
pub fn run_all_concurrency_examples() {
    println!("\n");
    println!("╔════════════════════════════════════════╗");
    println!("║   Rust 并发编程 - 完整示例            ║");
    println!("╚════════════════════════════════════════╝");

    basic_threads();
    thread::sleep(Duration::from_millis(100));

    move_closures();
    message_passing();
    multiple_messages();

    println!("\n[跳过多个生产者示例以节省时间]");
    // multiple_producers(); // 会花较长时间

    mutex_basics();
    arc_mutex();
    refcell_vs_mutex();
    deadlock_example();
    send_sync_traits();
    parallel_computation();

    println!("\n[跳过生产者-消费者示例以节省时间]");
    // producer_consumer(); // 会花较长时间

    println!("\n[跳过线程池示例以节省时间]");
    // thread_pool_concept(); // 会花较长时间

    barrier_example();
    concurrency_best_practices();

    println!("\n=== 并发编程示例完成 ===\n");
}
