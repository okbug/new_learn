
let counter = 0;
let listeners = [];
let isSubscribed = false;
function useSelector(){
    let nextCounter = ++counter;
    console.log('useSelector',nextCounter)
    if(!isSubscribed){
        isSubscribed=true;
        subscribe(()=>{
            //订阅函数中的nextCounter永远会指向第一次执行useSelector的的时候定义的函数内的局部变量
            console.log('nextCounter',nextCounter)
        })
    }
}
function subscribe(listener){
    listeners.push(listener);
}
useSelector();
listeners.forEach(l=>l());
useSelector();
listeners.forEach(l=>l());
useSelector();
listeners.forEach(l=>l());