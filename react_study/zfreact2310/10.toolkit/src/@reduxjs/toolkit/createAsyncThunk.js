import createAction from './createAction';
/**
 * createAsyncThunk 接收redux动作类型和一个返回 Promise的异步请求函数
 * typePrefix 动作类型的前缀
 * payloadCreator 异步请求函数
 * 它会基于你传递的动作类型前缀生成promise生命周期的动作类型
 * 并且最终会返回一个thunk动作的创建者，这个thunk动作的创建者会根据promise函烽并且派发生命周期动作
 * 它抽象了处于异步请求生命周期的标准方法
 */
function createAsyncThunk(typePrefix,payloadCreator){
    const pending = createAction(`${typePrefix}/pending`,()=>{
        return {payload:void 0};
    })
    const fulfilled = createAction(`${typePrefix}/fulfilled`,(payload)=>{
        return {payload};
    })
    const rejected = createAction(`${typePrefix}/rejected`,(error)=>{
        return {error};//action={type:'todos/rejected',error}
    })
    function actionCreator(){//getTodos
        //返回一个thunk函数
        return function(dispatch){//asyncThunk
            dispatch(pending());
            const axiosPromise = payloadCreator();
            return axiosPromise.then(
                result=>dispatch(fulfilled(result)),
                error=>dispatch(rejected(error)),
            )
        }
    }
    return Object.assign(actionCreator,{pending,fulfilled,rejected});
}
export default createAsyncThunk;