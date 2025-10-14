import {configureStore} from '../@reduxjs/toolkit';
import todosApi from '../todosApi';
const store = configureStore({
    reducer:{
        [todosApi.reducerPath]:todosApi.reducer
    },
    middleware:(defaultMiddlewares)=>defaultMiddlewares().concat(todosApi.middleware)
});
export default store;