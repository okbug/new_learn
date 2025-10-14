import {configureStore,Middleware} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import home from './slices/home';
import cart from './slices/cart';
import profile from './slices/profile';
import {routerMiddleware,createReduxHistory,routerReducer} from './history';
const store = configureStore({
    reducer:{
        home,
        cart,
        profile,
        router:routerReducer
    },
    middleware:(getDefaultMiddlewares)=>{
        const middlewares = getDefaultMiddlewares().concat(routerMiddleware);
        middlewares.push(logger as Middleware);
        return middlewares;
    }
});
export const history = createReduxHistory(store);
export {
    store
}
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
//redux-first-history