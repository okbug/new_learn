import {configureStore,createAction,createReducer} from './@reduxjs/toolkit';
import logger from 'redux-logger';
const add = createAction('ADD');//返回的是一个actionCreator
const minus = createAction('MINUS',(payload)=>{
	return {
		payload:payload*2
	}
});
const reducer = createReducer({number:0},(builder)=>{
	builder
    .addCase(add, (state) => {
      state.number++
    })
	.addCase(minus, (state, action) => {
	  state.number-=action.payload;
	})
});
const store = configureStore({
	reducer,//配置reducer处理函数
	middleware:(defaultMiddlewares)=>[...defaultMiddlewares(),logger],//配置中间件
	preloadedState:{number:5}//配置初始状态
});
const valueEl = document.getElementById('value');
function render(){
	valueEl.innerHTML = store.getState().number;
}
render();
store.subscribe(render)
document.getElementById('add').addEventListener('click',()=>store.dispatch(add()));
document.getElementById('minus').addEventListener('click',()=>store.dispatch(minus(2)));
document.getElementById('asyncAdd').addEventListener('click',()=>store.dispatch((dispatch)=>{
	setTimeout(()=>{
		dispatch(add());
	},1000);
}));