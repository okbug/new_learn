import { LOCATION_CHANGE } from "./actions";
export function createRouterReducer(history){
    const initialState = {
        action:history.action,
        location:history.location
    }
    return function(state=initialState,action){
        if(action.type === LOCATION_CHANGE){
            return {
                ...state,
                action:action.payload.action,
                location:action.payload.location
            }
        }else{
            return state;
        }
    }
}