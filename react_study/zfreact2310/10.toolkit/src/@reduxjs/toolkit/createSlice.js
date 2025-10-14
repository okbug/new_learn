import createAction from "./createAction";
import createReducer from "./createReducer";

/**
 * createSlice函数允许我们提供一个带有reducer函数的对象
 * 并且它将根据我们列出的reducer的名称自动生成action type字符串和action creator函数
 * createSlice会返回一个分片的对象，包括了生成的reducer函数，以及reducer名称，以及actions对象上的actionCreators
 */
function createSlice(options){
    const {name,initialState={},reducers={},extraReducers={}} = options;
    const prefixedReducers = {};
    const actions ={};
    Object.keys(reducers).forEach((key)=>{
        const type = `${name}/${key}`;
        //prefixedReducers['counter1/add']=reducer;
        prefixedReducers[type]=reducers[key];
        //actions.add = ()=>({type:'counter1/add'})
        actions[key]=createAction(type);
    });
    const reducer = createReducer(initialState,prefixedReducers,extraReducers);
    return {
        name,
        reducerPath:name,
        reducer,
        actions
    }
}
export default createSlice;