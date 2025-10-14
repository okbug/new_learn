## 1.hash路由
利用hash切换来实现前端路由

## 2.Browser路由 
- 利用html5中的history API实事路由的切换

- window.history是一个BOM对象，它提供了与浏览器历史记录交互的方法和属性
- 这个对象可以让你在用户的浏览历史中进行移动 ，类似于在浏览器中点击前进和后退 的按钮
- history提供了很多的方法和属性。但是由于安全原因，大多数浏览器都限制了history的能力
- 比如不能查看用户的历史记录，只能知道有多少条，但不知道它们是什么
- 也不能跨域修改历史记录，一切都是为安全隐私保护

- history.length 返回浏览器历史列表中的URL数量， 此数据包括当前的页面
- history.back 与点击浏览器中的回退按钮效果相同，都是让用户导航到前一个历史记录
- history.forward 与点击浏览器中的前进按钮效果相同，导航下下一个历史记录
- history.go(n) 使用户导航到历史记录中的特定位置 ，n是一个参数，是一个整数，表示相对于当前页面的位置 
history.go(1)=history.forward history.go(-1)=history.back 
- history.pushState(state,,url) 向历史栈中添加一个新的条目，条目包括状态和uRL地址,并且不会刷新页面。
- history.replaceState(state,url) 更新当前的历史记录的状态对象



uesRouters 是怎么执行的  我平时项目都是 APP里面写一个useRoues()   
返回element之后是怎么渲染的呢？
这个DEMO的  我能理解  但是App里面的  执行机制 我就很想知道是怎么执行的
怎么没看到处两种路由的区别呢
因为react-router这个库特别的帮我们抹了它们之间的差异，用起来是一样。
唯一的区别就是指定路径的方式不同
如果是hash路由的话
http://localhost:3000/#/profile
如果是browser的话
http://localhost:3000/profile

我的意思是 我们实现起来 也没有区别处理么
我们还没有实现
差异是在history这个包里面吧？这个包里面实现了hash和history
差异是在这两个方法中
import { createHashHistory, createBrowserHistory } from 'history';
还没有实现



渲染的时候根据路径选择一个元素渲染能理解 
当路径路径改变的时候 APP里面的 useRoutes 是不是又重新执行了  
肯定是的
如果没有重新执行 是怎么切换元素渲染呢

react-router-dom V5 里当使用HashRouter的时候，如果没有默认hash会添加默认hash
但是在react-router-dom V6里，里当使用HashRouter的时候，如果没有默认hash不会添加默认hash

下面实现最难最复杂的一个点
嵌套路由和Outlet


## 受保护路由
