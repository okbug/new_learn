package main

import (
	"fmt"
	"math"
	"time"
)

// 1. 变量声明
func variablesDemo() {
	fmt.Println("\n=== 变量声明 ===")

	// 方式1: var 关键字
	var name string = "张三"
	var age int = 25

	// 方式2: 类型推断
	var city = "北京"

	// 方式3: 短变量声明（只能在函数内使用）
	country := "中国"

	// 多变量声明
	var x, y, z int = 1, 2, 3

	fmt.Printf("姓名: %s, 年龄: %d, 城市: %s, 国家: %s\n", name, age, city, country)
	fmt.Printf("x=%d, y=%d, z=%d\n", x, y, z)
}

// 2. 常量
func constantsDemo() {
	fmt.Println("\n=== 常量 ===")

	const Pi = 3.14159
	const (
		StatusOK = 200
		StatusNotFound = 404
		StatusError = 500
	)

	fmt.Printf("Pi = %.5f\n", Pi)
	fmt.Printf("状态码: OK=%d, NotFound=%d, Error=%d\n", StatusOK, StatusNotFound, StatusError)
}

// 3. 基本数据类型
func dataTypesDemo() {
	fmt.Println("\n=== 基本数据类型 ===")

	// 整型
	var i int = 42
	var u uint = 42

	// 浮点型
	var f float64 = 3.14

	// 布尔型
	var b bool = true

	// 字符串
	var s string = "Hello, Go!"

	// 字符（rune是int32的别名）
	var r rune = '中'

	fmt.Printf("int: %d, uint: %d, float64: %.2f\n", i, u, f)
	fmt.Printf("bool: %t, string: %s, rune: %c\n", b, s, r)
}

// 4. 数组和切片
func arraysAndSlicesDemo() {
	fmt.Println("\n=== 数组和切片 ===")

	// 数组（固定长度）
	var arr [3]int = [3]int{1, 2, 3}
	arr2 := [...]int{4, 5, 6} // 自动推断长度

	// 切片（动态数组）
	slice1 := []int{1, 2, 3, 4, 5}
	slice2 := make([]int, 3, 5) // 长度3，容量5

	// 切片操作
	slice1 = append(slice1, 6, 7) // 追加元素
	subSlice := slice1[1:4]       // 切片：索引1到3

	fmt.Printf("数组: %v, %v\n", arr, arr2)
	fmt.Printf("切片: %v\n", slice1)
	fmt.Printf("slice2长度: %d, 容量: %d\n", len(slice2), cap(slice2))
	fmt.Printf("子切片: %v\n", subSlice)
}

// 5. Map（映射/字典）
func mapsDemo() {
	fmt.Println("\n=== Map ===")

	// 创建map
	scores := make(map[string]int)
	scores["张三"] = 95
	scores["李四"] = 87
	scores["王五"] = 92

	// 字面量创建
	ages := map[string]int{
		"Alice": 25,
		"Bob":   30,
		"Carol": 28,
	}

	// 访问和检查
	score, exists := scores["张三"]
	fmt.Printf("张三的分数: %d (存在: %t)\n", score, exists)

	// 遍历
	fmt.Println("所有年龄:")
	for name, age := range ages {
		fmt.Printf("  %s: %d岁\n", name, age)
	}

	// 删除
	delete(scores, "李四")
	fmt.Printf("删除后的分数: %v\n", scores)
}

// 6. 控制流 - if/else
func ifElseDemo() {
	fmt.Println("\n=== if/else ===")

	score := 85

	// 基本if/else
	if score >= 90 {
		fmt.Println("优秀")
	} else if score >= 80 {
		fmt.Println("良好")
	} else if score >= 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("不及格")
	}

	// if with 短语句
	if num := 10; num%2 == 0 {
		fmt.Printf("%d 是偶数\n", num)
	}
}

// 7. 控制流 - for循环
func forLoopDemo() {
	fmt.Println("\n=== for循环 ===")

	// 传统for循环
	fmt.Print("1-5: ")
	for i := 1; i <= 5; i++ {
		fmt.Print(i, " ")
	}
	fmt.Println()

	// while风格
	sum := 0
	i := 1
	for i <= 10 {
		sum += i
		i++
	}
	fmt.Printf("1到10的和: %d\n", sum)

	// 无限循环（配合break）
	count := 0
	for {
		count++
		if count > 3 {
			break
		}
		fmt.Printf("计数: %d\n", count)
	}

	// range遍历
	fruits := []string{"苹果", "香蕉", "橙子"}
	for index, fruit := range fruits {
		fmt.Printf("%d: %s\n", index, fruit)
	}
}

// 8. 控制流 - switch
func switchDemo() {
	fmt.Println("\n=== switch ===")

	day := time.Now().Weekday()

	switch day {
	case time.Saturday, time.Sunday:
		fmt.Println("周末")
	default:
		fmt.Println("工作日")
	}

	// 无表达式switch
	hour := time.Now().Hour()
	switch {
	case hour < 12:
		fmt.Println("上午")
	case hour < 18:
		fmt.Println("下午")
	default:
		fmt.Println("晚上")
	}
}

// 9. 函数
func add(a, b int) int {
	return a + b
}

func swap(x, y string) (string, string) {
	return y, x
}

func divide(a, b float64) (result float64, err error) {
	if b == 0 {
		return 0, fmt.Errorf("除数不能为零")
	}
	result = a / b
	return // 命名返回值可以直接return
}

func functionsDemo() {
	fmt.Println("\n=== 函数 ===")

	// 基本函数调用
	sum := add(3, 5)
	fmt.Printf("3 + 5 = %d\n", sum)

	// 多返回值
	a, b := swap("hello", "world")
	fmt.Printf("交换后: %s, %s\n", a, b)

	// 命名返回值和错误处理
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("错误:", err)
	} else {
		fmt.Printf("10 / 2 = %.2f\n", result)
	}

	// 匿名函数
	double := func(x int) int {
		return x * 2
	}
	fmt.Printf("5 的两倍: %d\n", double(5))
}

// 10. 结构体
type Person struct {
	Name string
	Age  int
	City string
}

// 方法（关联到结构体）
func (p Person) Greet() string {
	return fmt.Sprintf("你好，我是%s，来自%s", p.Name, p.City)
}

// 指针接收者方法（可以修改结构体）
func (p *Person) Birthday() {
	p.Age++
}

func structsDemo() {
	fmt.Println("\n=== 结构体 ===")

	// 创建结构体
	person1 := Person{
		Name: "张三",
		Age:  25,
		City: "北京",
	}

	person2 := Person{"李四", 30, "上海"}

	fmt.Println(person1.Greet())
	fmt.Printf("过生日前: %d岁\n", person1.Age)
	person1.Birthday()
	fmt.Printf("过生日后: %d岁\n", person1.Age)

	fmt.Printf("person2: %+v\n", person2)
}

// 11. 接口
type Shape interface {
	Area() float64
	Perimeter() float64
}

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}

func printShapeInfo(s Shape) {
	fmt.Printf("面积: %.2f, 周长: %.2f\n", s.Area(), s.Perimeter())
}

func interfacesDemo() {
	fmt.Println("\n=== 接口 ===")

	rect := Rectangle{Width: 5, Height: 3}
	circle := Circle{Radius: 4}

	fmt.Print("矩形 - ")
	printShapeInfo(rect)

	fmt.Print("圆形 - ")
	printShapeInfo(circle)
}

// 12. 指针
func pointersDemo() {
	fmt.Println("\n=== 指针 ===")

	x := 42
	p := &x // 获取地址

	fmt.Printf("x的值: %d\n", x)
	fmt.Printf("x的地址: %p\n", &x)
	fmt.Printf("p指向的地址: %p\n", p)
	fmt.Printf("p指向的值: %d\n", *p)

	*p = 100 // 通过指针修改值
	fmt.Printf("修改后x的值: %d\n", x)
}

// 13. defer
func deferDemo() {
	fmt.Println("\n=== defer ===")

	fmt.Println("开始")
	defer fmt.Println("延迟执行1（最后执行）")
	defer fmt.Println("延迟执行2（倒数第二执行）")
	fmt.Println("中间")
	fmt.Println("结束")
}

// 主函数 - 运行所有示例
func runBasics() {
	fmt.Println("========================================")
	fmt.Println("     Go 语言入门语法示例")
	fmt.Println("========================================")

	variablesDemo()
	constantsDemo()
	dataTypesDemo()
	arraysAndSlicesDemo()
	mapsDemo()
	ifElseDemo()
	forLoopDemo()
	switchDemo()
	functionsDemo()
	structsDemo()
	interfacesDemo()
	pointersDemo()
	deferDemo()

	fmt.Println("\n========================================")
	fmt.Println("     示例运行完成！")
	fmt.Println("========================================")
}
