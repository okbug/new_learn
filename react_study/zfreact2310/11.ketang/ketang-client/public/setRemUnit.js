let docEle = document.documentElement;
function setRemUnit(){
    //窗口宽度 iphone6 375px /37.5 =10px
    //比如说窗口宽度变为750,那么1rem=40px
    docEle.style.fontSize = docEle.clientWidth*2/37.5+'px';//20px
}
//一上来先计算REM, Root Element 指的就是根元素的fontSize ，默认值是16，但是16不好计算，可以把它改为10或者20
setRemUnit();
//另外当窗口大小发生变化的时候，可以重新计算rem的值
window.addEventListener('resize',setRemUnit)