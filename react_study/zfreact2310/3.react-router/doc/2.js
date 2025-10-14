const {pathToRegexp} = require('path-to-regexp');
let params = [];
let regexp = pathToRegexp('/home',params,{end:false});
console.log(regexp);/^\/home(?:[\/#\?](?=[]|$))?(?=[\/#\?]|[]|$)/i
console.log(regexp.test('/home'));
console.log(regexp.test('/home/'));
console.log(regexp.test('/home#'));
console.log(regexp.test('/home?'));
console.log(regexp.test('/home/user'));
