let dispatch;
let middlewareAPI = {
    dispatch:(action)=>dispatch(action)
}
//middlewareAPI.dispatch({})
dispatch = (action)=>console.log('action',action)
middlewareAPI.dispatch({type:'ADD'})
