//当浏览器里路径发生变化后会派发此动作给仓库，让仓库里的routerReducer计算新的路径信息状态
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
//调用历史对象上跳转路径的方法
export const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD';
export function locationChangeAction(payload){
    return {
        type:LOCATION_CHANGE,
        payload
    }
}
function updateLocation(method){//push replace
    return function(...args){
        return {
            type:CALL_HISTORY_METHOD,
            payload:{
                method,//调用哪个方法
                args//传递给方法的参数['/counter']
            }
        }
    }
}
export const push = updateLocation('push')