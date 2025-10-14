import { legacy_createStore as createStore } from 'redux';
const ADD = 'ADD';
const MINUS = 'MINUS';
const add = ()=>({type:ADD})
const minus = ()=>({type:MINUS})
function reducer(state = { number: 0 }, action) {
	switch (action.type) {
		case ADD: return { number: state.number + 1 };
		case MINUS: return { number: state.number - 1 };
		default: return state;
	}
}
const store = createStore(reducer)
const valueEl = document.getElementById('value');
function render(){
	valueEl.innerHTML = store.getState().number;
}
render();
store.subscribe(render)
document.getElementById('add').addEventListener('click',()=>store.dispatch(add()));
document.getElementById('minus').addEventListener('click',()=>store.dispatch(minus()));