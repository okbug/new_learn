
import EventEmitter from 'events';
import runSaga from './runSaga';
function createSagaMiddleware() {
    //用来监听事件和发射事件的
    const channel = new EventEmitter();
    let boundRunSaga;
    function sagaMiddleware({ getState, dispatch }) {
        boundRunSaga=runSaga.bind(null,{channel,getState,dispatch});
        return function (next) {
            return function (action) {
                //有人向仓库派发动作的时候，也会同时触发一个事件，事件的名称为动作类型
                channel.emit(action.type,action);
                return next(action);
            }
        }
    }
    sagaMiddleware.run = (saga) => boundRunSaga(saga);
    return sagaMiddleware;
}
export default createSagaMiddleware;