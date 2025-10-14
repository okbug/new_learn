import * as effectTypes from './effectTypes';
const TASK_CANCEL = 'TASK_CANCEL';
const isIterator = (value)=>typeof value[Symbol.iterator] === 'function';
/**
 * 开始运行一个saga
 * @param {*} env 环境 channel 
 * @param {*} saga 
 */
function runSaga(env, saga,callback) {
    const task = {cancel:()=>next(TASK_CANCEL)};
    const { channel, dispatch } = env;
    //此处要做兼容处理，判断saga参数是不是一个迭代器，如果是直接用，如果不用执行后使用
    const it = isIterator(saga)?saga:saga();
    function next(val,isError) {
        let result;
        if(isError){
            result = it.throw(val);
        }else if(val === TASK_CANCEL){
            //让此saga直接结束掉
            result=it.return(val);
        }else{
            result = it.next(val);
        }
        //取出第一个effect的value值
        const { value: effect, done } = result;
        //如果此saga尚未完成
        if (!done) {
            //如果此effect身上有Symbol.iterator函数属性的话
            if (isIterator(effect)) {
                //自动开启执行此effect对应的saga
                runSaga(env, effect,next);
                //当前的saga并不会阻塞，会继续向下执行
                //在原版代码中是需要等待上面的saga执行完了才可以继续向下执行，不能直接调用next
                //next();//TODO
            } else if (effect instanceof Promise) {
                effect.then(next);
            } else {
                switch (effect.type) {
                    case effectTypes.TAKE:
                        //监听有人向仓库派发某个动作，当派发那个动作后才会继续执行next,执行当前的saga
                        channel.once(effect.actionType, (action)=>next(action));
                        break;
                    case effectTypes.PUT:
                        //要向仓库派发动作
                        dispatch(effect.action);
                        //派发动作不会阻塞当前的saga,会继续向后执行
                        next();
                        break;
                    case effectTypes.FORK:
                        //如果这是一个fork指令 的话，开始执行这个fork里面的saga
                        let forkTask = runSaga(env,effect.saga(...effect.args));
                        //而执行里面的saga并不阻塞当前的saga继续向下执行
                        next(forkTask);
                        break;  
                    case effectTypes.CALL:
                        //传递参数并执行此函数，并等待promise完成，完成后接着调用next
                        effect.func(...effect.args).then(next,error=>next(error,true)); 
                        break;  
                    case effectTypes.CPS:
                        effect.func(...effect.args,(err,data)=>{
                            if(err){
                                next(err,true);
                            }else{
                                next(data);
                            }
                        }); 
                        break;
                    case effectTypes.ALL:
                        const {iterators} = effect;
                        let result = [];
                        let completedCount = 0;
                        iterators.forEach((iterator,index)=>{
                            runSaga(env,iterator,(data)=>{
                                result[index]=data;
                                if(++completedCount === iterators.length){
                                    next(result);
                                }
                            });
                        });
                        break;    
                    case effectTypes.CANCEL:
                        effect.task.cancel();
                        next();
                        break;
                    default:
                        break;    
                }
            }
        }else{
            callback?.(effect);
        }
    }
    next();
    return task;
}
export default runSaga;