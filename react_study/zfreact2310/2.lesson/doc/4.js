//老状态
let state = {count:{number:0}}

state.count.number++;

setState(state);

//新老对象内存地址一样，但是值已经改变了，这种情况就会出现该更新不更新的BUG


