function compilePath(path){
    //路径参数名的数组
    let paramNames = [];
    let regexpSource = '^'+path
    .replace(/:(\w+)/g,(_,key)=>{//  /:id 
        //先把收集到的路径参数名放到数组里暂存
        paramNames.push(key)
        return "([^\/#\?]+?)";
    })
    regexpSource+='$';
    let matcher = new RegExp(regexpSource);
    return [matcher,paramNames];
}
let [matcher,paramNames] = compilePath('/post/:id/:age');
console.log(matcher)
console.log(paramNames)
let result = '/post/100/200'.match(matcher);
console.log(result);//params = {id:100}
let values = result.slice(1);
let params = paramNames.reduce((memo,paramName,index)=>{
    memo[paramName]=values[index]
    return memo;
},{});
console.log(params)