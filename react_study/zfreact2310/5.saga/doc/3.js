const EventEmitter = require('events');
const e = new EventEmitter();
//给e注册一个click事件，当事件触发的时候执行回调
e.once('click',(data)=>{
    console.log('clicked',data)
});
//触发一个事件，类型为click
e.emit('click','hello');
//因为是用once注册的事件回调，所以不管你触发多少次的事件，都只会触发一次
e.emit('click','hello');