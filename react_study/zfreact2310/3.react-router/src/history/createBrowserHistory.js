//创建一个基于浏览器历史对象实现的历史对象
function createBrowserHistory(){
    //获取全局历史对象
    const globalHistory = window.history;
    //定义一个路径状态变量
    let state;
    //定义监听函数数组
    let listeners = [];
    //调用listen方法可以向数组中添加一个新的监听函数，用来监听路径的变化 
    //以后当路径发生变化了可以通知listener
    //1.用户手工输入新的路径 2.调用push replace go goBack goForward...
    function listen(listener){
        //把此新的监听函数添加到了监听函数数组中
        listeners.push(listener);
        //返回一个取消监听的函数
        return ()=>{
            listeners = listeners.filter(item=>item !== listener);
        }
    }
    function go(n){
        globalHistory.go(n);
    }
    function goBack(){
        globalHistory.go(-1);
    }
    function goForward(){
        globalHistory.go(1);
    }
    //定义添加新的路径和状态的函数
    //push('/user',{id:1})  push({pathname:'/user',state:{id:1}});
    function push(pathname,nextState){
        //定义动作为PUSH 如果你调用的是push方法的话，那么action就会变成PUSH
        const action = 'PUSH';
        //兼容两种调用的方式
        if(typeof pathname === 'object'){
            //如果pathname是一个对象的话，提取它里面的状态和路径
            state=pathname.state;
            pathname=pathname.pathname;
        }else{
            //否则说明状态作为第2个参数传递进来，可以直接把第2个参数赋值给state
            state=nextState;
        }
        //直接使用全局历史对象添加新的路径和状态
        globalHistory.pushState(state,null,pathname);
        let location = {
            pathname,//新的路径名
            state//新的状态
        }
        //通知所有的监听函数路径改变了
        //popstate 不能监听到pushState，这里面有解决吗？
        notify({
            action,
            location
        });
    }
    function replace(pathname,nextState){
        //定义动作为PUSH 如果你调用的是push方法的话，那么action就会变成PUSH
        const action = 'REPLACE';
        //兼容两种调用的方式
        if(typeof pathname === 'object'){
            //如果pathname是一个对象的话，提取它里面的状态和路径
            state=pathname.state;
            pathname=pathname.pathname;
        }else{
            //否则说明状态作为第2个参数传递进来，可以直接把第2个参数赋值给state
            state=nextState;
        }
        //直接使用全局历史对象添加新的路径和状态
        globalHistory.replaceState(state,null,pathname);
        let location = {
            pathname,//新的路径名
            state//新的状态
        }
        //通知所有的监听函数路径改变了
        notify({
            action,
            location
        });
    }
    //当用户点击前进后退按钮或者调用globalHistory.go方法的时候都会触发popstate,路径也会改变
    window.addEventListener('popstate',()=>{
        //获取最新的路径信息
        let location = {
            state:globalHistory.state,//状态是从windowHistory上取值
            pathname:window.location.pathname//路径是从location上取值pathname
        }
        //通知所有的监听函数执行，传入最新的action为POP，最新的location为最新的路径对象
        notify({
            action:'POP',
            location
        })
    });
    function notify({action,location}){
        history.action = action;
        history.location= location;
        history.length = globalHistory.length;
        //通知所有的监听函数执行
        listeners.forEach(listener=>{
            //让监听函数执行并传入最新的location
            listener({action,location});
        });
    }
    //初始化历史对象
    const history = {
        action:'POP',//动作
        go,
        goBack,
        goForward,
        push,
        replace,
        listen,
        location:{
            pathname:window.location.pathname,///路径名
            state:globalHistory.state//路径对应的状态值,这个值可能有，也可能没有
        }
    }
    return history;
}
export default createBrowserHistory