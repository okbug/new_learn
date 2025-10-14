

function createAsyncThunk(prefix,request){
    const data = request();
    let promise = new Promise((resolve)=>{
        resolve('wrap包装之后的结果');
    });
    promise.unwrap = ()=>{
        return Promise.resolve(data);
    }
    return promise;
}
let result = createAsyncThunk('validateLoginState',()=>'原始的结果');
console.log(result.unwrap);
result.unwrap().then(res=>{
    console.log(res)
});