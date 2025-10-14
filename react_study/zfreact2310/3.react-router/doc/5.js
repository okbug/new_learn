/**
(?=pattern) 正向肯定查找 正向前瞻 也就是后面必须跟着什么东西
 */
//正向肯定查找 不要消耗掉字符
console.log('1a'.match(/\d(?=[a-z])[a-z]/));
//正向否定查找 正向否定前瞻 也就是后面不能跟着什么东西
console.log('1a'.match(/\d(?![A-Z])[a-z]/));
//反向肯定
console.log('1a'.match(/(?<=[a-z])\d[a-z]/))
//反向否定
console.log('1a'.match(/(?<![A-Z])\d([a-z])/))
//[ '1a', index: 0, input: '1a', groups: undefined ]

let array = ['1a'];
array.index = 0;
array.input = '1a';
array.groups = undefined;
console.log(array)