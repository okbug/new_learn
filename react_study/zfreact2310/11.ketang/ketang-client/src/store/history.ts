import {createBrowserHistory} from 'history'
import {createReduxHistoryContext} from 'redux-first-history';
const history = createBrowserHistory();
export const {routerMiddleware,createReduxHistory,routerReducer} = createReduxHistoryContext({history});
