
function* gen() {
    console.log('start')
    let a = yield 1;
    console.log('a', a)
    let b = yield 2;
    console.log('b', b)
    let c = yield 3;
    console.log('c', c)
}
let it = gen();
let r1 = it.next();
console.log(r1);
let r2 = it.next('a的值');
console.log(r2);
let r3 = it.next('b的值');
console.log(r3);