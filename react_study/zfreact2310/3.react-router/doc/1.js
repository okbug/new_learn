const {pathToRegexp} = require('path-to-regexp');
let params = [];
let regexp = pathToRegexp('/home',params,{end:true});
console.log(regexp);//^\/home[\/#\?]?$
console.log(regexp.test('/home'));
console.log(regexp.test('/home/'));
console.log(regexp.test('/home#'));
console.log(regexp.test('/home?'));
console.log(regexp.test('/home/user'));

let result = '1998-09'.match(/(?<year>\d{4})-(?<month>\d{2})/);
console.log(result.groups.year,result.groups.month)