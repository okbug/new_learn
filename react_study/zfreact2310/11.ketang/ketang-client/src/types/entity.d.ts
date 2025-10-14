//定义轮播图地象的接口类型
interface Slider{
    url:string;
}
interface Lesson {
    id:string;//课程ID
    order:number;//顺序号
    title:string;//标题
    video:string;//视频地址
    poster:string;//海报
    url:string;//url地址
    price:string;//价格
    category:string;//课程的分类
}
interface LessonsBody {
    hasMore:boolean;
    list:Array<Lesson>
}


interface User{
    id:string;
    username:string;//用户名
    password:string;//密码
    email:string;//邮箱
    avatar:string;//头像
}
interface RegisterPayload{
    username:string;//用户名
    password:string;//密码
    confirmPassword:string;//确认密码
    email:string;//邮箱
}
interface LoginPayload{
    username:string;//用户名
    password:string;//密码
}