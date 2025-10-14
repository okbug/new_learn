import {ADD2,MINUS2} from '../action-types';
const actionCreators = {
    add2(){
        return {type:ADD2};
    },
    minus2(){
        return {type:MINUS2};
    }
}
export default actionCreators;