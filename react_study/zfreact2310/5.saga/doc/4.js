function * gen(){
    console.log('first')
}
const iterator = gen();
//所有的迭代器都会有一个Symbol.iterator属性，而它是一个函数
console.log(iterator[Symbol.iterator])