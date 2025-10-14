内部的请求过程
1.调用request获取响应。因为我们编写了响应拦截器，所以说得到数据是响应体
request或者说axios正常来说获取的响应是{headers,data}
直接可以得到了data
就是响应体
{
    success:true,
    data:{
        list,
        total
    }
}
又因为我们在config.ts配置文件中配置了
request: {//启用内置的请求插件
    dataField: ''//提取响应中的data字段
  }
导致又自动提取了一次data
得到
{
        list,
        total
    }
所以说最后得到的响应结果就是
{list,total}



formatResult: result => result?.data,

Angel 2024/1/13 09:54:36
useModel和React官方的useModel作用是不是一样的？
官方没有useModel
这个useModel是UMI4提供的一个全局状态管理的插件，类似于zustand

周啸宇 2024/1/13 10:01:46
还有验证码 我们会在后面会在项目中用户注册的时候用到

jdyl 2024/1/13 10:03:32
这个时候 是不是常量枚举合适一些  

李志超 2024/1/13 10:07:46
感觉对request.post做一层封装更好点

jdyl 2024/1/13 10:10:10
request   和useRequest  他俩是一个吗  感觉一会这个 有i那个 有点迷糊啊


request=axios 用来发请求的
useRequest它是一个自定义的hooks,用来调用request,也就是axios获取结果，并且返回数据


function useRequest(request){
    const response = await request();
    return {data:response.data}
}


李志超 2024/1/13 10:16:47
实际开发中  是否应该对每个接口的返回值类型做定义呢，
最近这个问题在团队中有分歧  有人说这样用  不利于维护

jdyl 2024/1/13 10:17:59
我平时对所有的返回值 主要字段加了类型定义 其他的 [propName: string]: any  处理了

李志超 2024/1/13 10:21:18
嗯 只定义了用到的返回值  我那个同事没有把类型定义放在apis目录内  定义在了具体的页面中  所以看着可以没那么优雅   我也觉得用还是要用的

周啸宇 2024/1/13 10:22:22
老师登陆注册为什么不弄个tab放在一个页面里
useModel('@@initialState') 用法是不是和useState 一样？
只不过useModel('@@initialState')是全局的？

axios的泛型 是2个  前后都一样吧

axios<T,R>
T指的是响应体 user
R指的是响应对象 {headers,config,data:user}


数据库mongodb mysql
node express koa nest.js
状态管理工具 redux mobx 