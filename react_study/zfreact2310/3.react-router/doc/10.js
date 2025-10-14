
//一段一段匹配
//用metas数组一段一段的匹配路径
let metas =['/user','/add']
let metas2 =['/user','list']
let pathname = '/user/list';


let metas3 = ['/user','detail/:id','age/:age'];
let pathname2 = '/user/detail/100/age/18';

let matches = [
    {params:{},route:{element:<User/>}},
    {params:{id:1701870982137},route:{element:<UserDetail/>}}
]
