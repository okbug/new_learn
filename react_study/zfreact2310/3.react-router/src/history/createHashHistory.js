//定义创建基于hash实现的历史对象的方法
function createHashHistory() {
    //定义历史条目栈
    let stack = [];
    //定义栈顶指针的索引
    let index = -1;
    //定义当前的动作
    let action = 'POP';
    //当前路径的状态
    let state;
    //定义监听函数数组
    let listeners = [];
    //复用监听函数
    function listen(listener) {
        //把此新的监听函数添加到了监听函数数组中
        listeners.push(listener);
        //返回一个取消监听的函数
        return () => {
            listeners = listeners.filter(item => item !== listener);
        }
    }
    function push(pathname,nextState) {
        //定义动作为PUSH 如果你调用的是push方法的话，那么action就会变成PUSH
        action = 'PUSH';
        //兼容两种调用的方式
        if (typeof pathname === 'object') {
            //如果pathname是一个对象的话，提取它里面的状态和路径
            state = pathname.state;
            pathname = pathname.pathname;
        } else {
            //否则说明状态作为第2个参数传递进来，可以直接把第2个参数赋值给state
            state = nextState;
        }
        //通过修改hash为修改路径
        window.location.hash = pathname;
    }
    function go(n){
        action = 'POP';
        //用当前的索引加上步长得到更新后的过引
        index+=n;
        //再从历史栈中获取新的路径信息
        let nextLocation = stack[index];
        state=nextLocation.state;
        //把最新的路径赋给hash值就可了
        window.location.hash = nextLocation.pathname;
    }
    function goBack(){
        globalHistory.go(-1);
    }
    function goForward(){
        globalHistory.go(1);
    }
    function handleHashChange(){
        //获取最新的写在hash值中的路径名
        const pathname = window.location.hash.slice(1);
        history.action = action;
        const location = {pathname,state}
        history.location = location;
        //如果是PUSH动作，则意味着添加新的条目到历史条目栈中
        if(action === 'PUSH'){
            //hash在我理解就是 push新增  其他的就是数组索引改变
            stack[++index]=location;
        }
        listeners.forEach(listener=>{
            //让监听函数执行并传入最新的location
            listener({action,location});
        });
    }
    window.addEventListener('hashchange',handleHashChange);
    const history = {
        action: 'POP',//动作
        go,
        goBack,
        goForward,
        push,
        listen,
        location: {
            pathname: undefined,
            state: undefined
        }
    }
    //初始化路径
    if(window.location.hash){
        action = 'PUSH';
        handleHashChange();
    }else{
        window.location.hash = '/';
    }
    return history;
}
export default createHashHistory