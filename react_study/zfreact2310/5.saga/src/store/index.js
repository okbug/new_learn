import {legacy_createStore as createStore,applyMiddleware} from 'redux';
import createSagaMiddleware from '../redux-saga';
import rootSaga  from './sagas';
const sagaMiddleware = createSagaMiddleware();
import reducer from './reducer';
const store = applyMiddleware(sagaMiddleware)(createStore)(reducer);
//调用sagaMiddleware的run方法启动根saga
//在saga里会不断的触发不同的指令对象，由saga中间件负责接收并进行响应处理
sagaMiddleware.run(rootSaga);
export default store;