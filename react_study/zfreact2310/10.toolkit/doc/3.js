//const {createSelector}= require('reselect');
/**
 * 依赖reselect
 * reselect可以缓存运算结果，提升性能
 * reselect原理是只要相关的状态不变，就可以直接使用上一次的缓存的结果
 */
function createSelector(selectors,reducer){
    let lastState;
    let lastValue;
    return function(state){
        if(state===lastState){
            return lastValue;
        }
        let values = selectors.map(selector=>selector(state));
        lastValue =  reducer(...values)
        lastState = state;
        return lastValue;
    }
}
const selectCounter1 = state=>state.counter1;
const selectCounter2 = state=>state.counter2;
const sumSelector = createSelector([selectCounter1,selectCounter2],(counter1State,counter2State)=>{
    console.log('重新计算结果')
    return counter1State.number+counter2State.number;
});
let state = {counter1:{number:1},counter2:{number:2}}
let sum1 = sumSelector(state);
console.log('sum1',sum1)
let sum2 = sumSelector(state);
console.log('sum2',sum2)
let sum3 = sumSelector( {counter1:{number:3},counter2:{number:4}});
console.log('sum3',sum3)