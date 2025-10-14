
import React from 'react';
import {bindActionCreators} from '../../redux';
import ReactReduxContext from '../ReactReduxContext';
function useBoundDispatch(actionCreators){
    const {store} = React.useContext(ReactReduxContext);
    return bindActionCreators(actionCreators,store.dispatch);
}
export default useBoundDispatch;