import {configureStore,createSlice,createSelector} from '@reduxjs/toolkit';
import logger from 'redux-logger';
const counter1Slice = createSlice({
	name:'counter1',
	initialState:{number:0},
	reducers:{
		add:(state)=>{
			state.number+=1;
		},
		minus:(state,action)=>{
			state.number-=action.payload;
		}
	}
})
const {add:add1,minus:minus1} = counter1Slice.actions;
const counter2Slice = createSlice({
	name:'counter2',
	initialState:{number:0},
	reducers:{
		add:(state)=>{
			state.number+=1;
		},
		minus:(state,action)=>{
			state.number-=action.payload;
		}
	}
})
const {add:add2,minus:minus2} = counter2Slice.actions;
const store = configureStore({
	reducer:{
		[counter1Slice.reducerPath]:counter1Slice.reducer,
		[counter2Slice.reducerPath]:counter2Slice.reducer
	},
	middleware:(defaultMiddlewares)=>[...defaultMiddlewares(),logger],//配置中间件
	preloadedState:{[counter1Slice.reducerPath]:{number:0},[counter2Slice.reducerPath]:{number:0}}//配置初始状态
});
const valueEl1 = document.getElementById('value1');
function render1(){
	valueEl1.innerHTML = store.getState().counter1.number;
}
render1();
store.subscribe(render1)
const valueEl2 = document.getElementById('value2');
function render2(){
	valueEl2.innerHTML = store.getState().counter2.number;
}
render2();
store.subscribe(render2)
const sumSelector = createSelector([state=>state.counter1,state=>state.counter2],(counter1,counter2)=>{
	console.log('计算sum');
	return counter1.number+counter2.number;
})
const sumEl = document.getElementById('sum');
function renderSUM(){
	sumEl.innerHTML = sumSelector(store.getState());
}
renderSUM();
store.subscribe(renderSUM)
document.getElementById('add1').addEventListener('click',()=>store.dispatch(add1()));
document.getElementById('minus1').addEventListener('click',()=>store.dispatch(minus1(0)));
document.getElementById('add2').addEventListener('click',()=>store.dispatch(add2()));
document.getElementById('minus2').addEventListener('click',()=>store.dispatch(minus2(0)));
