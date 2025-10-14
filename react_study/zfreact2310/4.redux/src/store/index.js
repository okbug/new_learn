import {legacy_createStore as createStore,applyMiddleware} from '../redux';
import rootReducer from './reducers';
import logger from './redux-logger';
import thunk from './redux-thunk';
import promise from './redux-promise';
const store  = applyMiddleware(promise,thunk,logger)(createStore)(rootReducer);
export default store;
