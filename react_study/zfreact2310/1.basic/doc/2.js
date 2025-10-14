class Person{
    //可以给类组件的类型添加一个静态属性
    static isReactComponent = true
}

console.log(typeof Person);//function
console.log(Person.isReactComponent);//true