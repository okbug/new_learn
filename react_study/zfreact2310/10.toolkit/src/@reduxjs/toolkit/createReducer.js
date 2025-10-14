import produce from 'immer';
function createReducer2(initialState, builderCallback) {
    //用于存储每种action类型对应的处理函数
    const actionsMap = new Map();
    const builder = {
        addCase(actionCreator, reducer) {
            //把动作类型和对应的状态计算函数进行了关联
            actionsMap.set(actionCreator.type,reducer);
            return this;
        }
    }
    builderCallback(builder);
    return function reducer(state = initialState, action) {
        const caseReducer = actionsMap.get(action.type);
        if(caseReducer){
           return produce(state,(draft)=>{
                caseReducer(draft,action);
           });
        }
        return state;
    }
}
function createReducer(initialState,reducers,extraReducers){
    const actionsMap = new Map();
    const builder = {
        addCase(actionCreator, reducer) {
            actionsMap.set(actionCreator.type,reducer);
            return this;
        }
    }
    extraReducers(builder);
    return function(state=initialState,action){
        const reducer = reducers[action.type];
        if(reducer){
            return produce(state,draft=>{
                reducer(draft,action);
            });
        }
        const caseReducer = actionsMap.get(action.type);
        if(caseReducer){
           return produce(state,(draft)=>{
                caseReducer(draft,action);
           });
        }
        return state;
    }
}
export default createReducer;