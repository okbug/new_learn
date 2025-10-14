const {pathToRegexp} = require('path-to-regexp');
let paramNames = [];//路径参数名的数组
let regexp = pathToRegexp('/post/:id',paramNames,{end:true});
console.log(regexp);//  /^\/post(?:\/([^\/#\?]+?))[\/#\?]?$/i
let result = '/post/100'.match(regexp);
console.log(result);//
console.log(paramNames);//
