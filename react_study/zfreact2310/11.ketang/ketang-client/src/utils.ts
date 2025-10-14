/**
 * 上拉加载下一页
 * 就滚动到底部的时候就自动加载下一页的数据
 */
export function reachBottom(element: HTMLElement, callback: () => void): void {
    const handleScroll = () => {
        const clientHeight = element.clientHeight;//获取容器的高度
        const scrollTop = element.scrollTop;//向上滚动的高度
        const scrollHeight = element.scrollHeight;//内容的高度
        if (clientHeight + scrollTop + 10 >= scrollHeight) {
            callback()
        }
    }
    const debouncedHandleScroll = debounce(handleScroll, 300)
    element.addEventListener('scroll', debouncedHandleScroll);
}
/**
 * 这是一个防抖的函数
 * @param func 
 * @param wait 
 * @returns 
 */
export function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return function (...args: any[]) {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    }
}
type EventWithTouch = Event & { touches: TouchList }
export function throttle(func:(...args:any[])=>void,delay:number):(...args:any[])=>void{
    let prev = Date.now();
    return function(this:any,...args:any[]){
        const now = Date.now();
        if(now - prev >= delay){
            func.apply(this,args);
            prev = now;
        }
    }
}
export function pullRefresh(element: HTMLElement, callback: () => void): void {
    //当开始上拉的时候Y坐标
    let startY: number;
    //向下拉动的距离
    let distance: number;
    //记录此元素最初top值
    let originalTop: number = element.offsetTop;
    const touchMoveThrottled = throttle((event: EventWithTouch) => {
        //获取触摸点最新的纵坐标
        const pageY = event.touches[0].pageY;
        if (pageY > startY) {
            //获取向下拉的距离
            distance = pageY - startY;
            element.style.top = `${originalTop + distance}px`;
        } else {
            element.removeEventListener('touchmove', touchMoveThrottled);
            element.removeEventListener('touchend', touchEnd)
        }
    },30)
    const touchEnd = (): void => {
        element.removeEventListener('touchmove', touchMoveThrottled);
        element.removeEventListener('touchend', touchEnd)
        if (distance > 30) {
            callback();
        }
        function scrollBack(){
            const currentTop = element.offsetTop;
            if (currentTop > originalTop) {
                element.style.top = `${currentTop - 1}px`;
                requestAnimationFrame(scrollBack);
            } else {
                element.style.top = `${originalTop}px`;
            }
        }
        requestAnimationFrame(scrollBack);
    }
    //绑定触摸开始事件
    element.addEventListener('touchstart', (event: EventWithTouch) => {
        //只在在向上卷去的高度为0的时候才有下拉刷新效果
        if (element.scrollTop === 0 && element.offsetTop===originalTop) {
            //获取触摸的Y坐标
            startY = event.touches[0].pageY;
            element.addEventListener('touchmove', touchMoveThrottled);
            element.addEventListener('touchend', touchEnd)
        }
    });
}