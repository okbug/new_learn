let attr1 = {
    name:'zhang'
}
let attr2 = {
    name:'san'
}
let obj1 = {
    attr1,
    attr2
}
let obj2 = {
    attr1,
    attr2:{name:'x'}
}


let state = {number:0}

state.number++;

const newState = state;

//PureComponent浅比较 就出问题，本来应该渲染但是却没有渲染


