import { legacy_createStore,applyMiddleware,combineReducers } from "redux";
import {thunk} from 'redux-thunk';
function configureStore(options={}){
    const {reducer,middleware,preloadedState} = options;
    let rootReducer;
    if(typeof reducer === 'function'){
        rootReducer = reducer;
    }else{
        rootReducer=combineReducers(reducer);
    }
    const defaultMiddlewares = ()=>[thunk]
    const middlewares = typeof middleware ==='function'?middleware(defaultMiddlewares):defaultMiddlewares();
    const store = applyMiddleware(...middlewares)(legacy_createStore)(rootReducer,preloadedState);
    return store;
}
export default configureStore;