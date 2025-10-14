/**
 * 绑定一个action的创建者
 * @param {*} actionCreator action创建者 
 * @param {*} dispatch 派发动作的方法
 * @returns 绑定后的新函数，调用绑定后的新函数之后可能自动派发动作
 */
function bindActionCreator(actionCreator,dispatch){
    return function(...args){debugger
        return dispatch(actionCreator.apply(this,args));
    }
}
/**
 * 绑定action的创建者
 * actionCreators action创建者，可以是一个actionCreator函数，也可能是多个actionCreator函数的数组
 * dispatch 仓库用来派发动作的函数
 */
export default function bindActionCreators(actionCreators,dispatch){
    if(typeof actionCreators === 'function'){
        return bindActionCreator(actionCreators,dispatch);
    }
    const boundActionCreators = {};
    for(const key in actionCreators){
        const actionCreator = actionCreators[key];
        if(typeof actionCreator === 'function'){
            boundActionCreators[key]=bindActionCreator(actionCreator,dispatch);
        }
    }
    return boundActionCreators;
};