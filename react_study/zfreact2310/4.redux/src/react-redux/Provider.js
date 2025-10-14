import React from 'react';
import ReactReduxContext from './ReactReduxContext';
function Provider({store,children}){
    const value = {store};
    return (
        <ReactReduxContext.Provider value={value}>
            {children}
        </ReactReduxContext.Provider>
    )
}
export default Provider;