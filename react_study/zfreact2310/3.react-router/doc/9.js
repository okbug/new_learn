
const routes = [
    {
        path: '/user',
        element: 'User',
        children: [
            { path: 'add', element: 'UserAdd' },
            { path: 'list', element: 'UserList' },
            { path: 'detail/:id', element: 'UserDetail' }
        ]
    }
]
/**
 * 把多维变一维，打平所有的分支
 * @param {*} routes 原始的routes数组 [{path,element}]
 * @param {*} branches 分支数组
 * @param {*} parentsMeta 父meta数组
 * @param {*} parentPath  父路径
 */
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = '') {
    routes.forEach((route,index)=>{
        //定义一个路由匹配的元数据
        let routeMeta = {
            route,
            relativePath:route.path
        }
        // ['','/user'] => //user =>/user path代表本分支对应的路径
        let path = joinPaths([parentPath,routeMeta.relativePath]);
        //把父亲的路由meta数组加上自己的meta数组变成一个新数组
        let routesMeta = parentsMeta.concat(routeMeta);
        //如果它有儿子的话
        if(route.children && route.children.length>0){
            //打平儿子分支，传入子路由数组，分支数组
            flattenRoutes(route.children,branches,routesMeta,path);
        }
        branches.push({
            path,
            routesMeta
        })
    });
    return branches;
}
/**
 * 把路径进行用/连接 ，并且如果连接后出现多个/就替换成一个/
 * @param {*} paths 
 * @returns 拼接好的路径
 */
function joinPaths(paths){// ['/user','/add'] /user///add=>/user/add
    return paths.join('/').replace(/\/\/+/g,'/');//
}
let branches = flattenRoutes(routes);
console.log(JSON.stringify(branches,null,2))
let pathname = '/user/list';