import { CALL_HISTORY_METHOD } from "./actions";
export function createRouterMiddleware(history){
    return function(){
        return function(next){
            return function(action){//改造后的dispatch
                //如果此动作是想调用历史对象上的方法的话
                if(action.type === CALL_HISTORY_METHOD){
                    //获取想调用的方法和参数
                    const {method,args} = action.payload;
                    //调用历史对象上的方法，并传递参数
                    history[method](...args);
                    //history.push('/counter');
                }else{
                    return next(action);
                }
            }
        }
    }
}