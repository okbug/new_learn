import {ADD1,MINUS1} from '../action-types';
const initialState ={number:0}
export default function(state=initialState,action){
    switch(action.type){
        case ADD1:{
            //return {number:state.number+1}
            const {payload=1,error} = action;
            if(error){
                return {number:state.number-payload};
            }else{
                return {number:state.number+payload};
            }
        }
        case MINUS1:
            return {number:state.number-1}
        default:return state;
    }
}
/**
 * 虽然redux规定整个应用不管多大，都只有一个仓库，仓库里只有一个reducer和一个仓库对象
 * 但是我们可以分而治之
 * 我们可以定义多个reducer,每个reducer都自己维护和管理一个分状态或者说子状态
 * 最后再把这些子reducer合并成一个大的reducer,所有的子状态也会合成成一个大状态
 */