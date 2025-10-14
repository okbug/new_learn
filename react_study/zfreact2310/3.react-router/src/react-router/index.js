import React from 'react';
//创建导航上下文
const NavigationContext = React.createContext({});
//创建路径上下文
const LocationContext = React.createContext();
//创建路由上下文 存放当前路由匹配的结果 ，比如说路径参数对象
const RouteContext = React.createContext({});
//导出这二个上下文实现共享，让别人也可以读取到
export {
    NavigationContext,
    LocationContext
}
/**
 * 最核心的路由容器组件
 * @param children 子元素
 * @param location 路径对象里面有路径名
 * @param navigator history历史对象,也称为导航对象
 */
export function Router({ children, location, navigator }) {
    const navigationContext = React.useMemo(() => ({ navigator }), [navigator]);
    const locationContext = React.useMemo(() => ({ location }), [location]);
    return (
        <NavigationContext.Provider value={navigationContext}>
            <LocationContext.Provider value={locationContext}>
                {children}
            </LocationContext.Provider>
        </NavigationContext.Provider>
    )
}
export function useLocation() {
    //location={pathname=window.location.pathname,state=window.history.state}
    return React.useContext(LocationContext).location;
}
export function Routes({ children }) {
    //把子元素转成routes配置数组
    const routes = createRoutesFromChildren(children);
    //使用useRoutes这个自定义hooks进行渲染
    return useRoutes(routes);
}
/**
 * 根据路由配置数组渲染对应的组件
 * @param {*} routes 
 */
export function useRoutes(routes) {
    //获取当前的路径对象
    const location = useLocation();
    //获取当前的路径名
    const pathname = location.pathname;
    //使用地址栏中的路径名和routes数组进行匹配,获取匹配的结果 
    const matches = matchRoutes(routes, pathname);
    //渲染匹配的结果
    return _renderMatches(matches);
}
function _renderMatches(matches) {
    if (!matches) return null;
    //从右向左进行遍历
    //let matches = [
    //    {params:{},route:{element:<User/>}},
    //    {params:{id:1701870982137},route:{element:<UserDetail/>}}
    //]
    return matches.reduceRight((outlet, match, index) => (
        <RouteContext.Provider value={{ outlet, matches: matches.slice(0, index + 1) }}>
            {match.route.element}
        </RouteContext.Provider>
    ), null);
}
/**
 * 使用路由配置数组和路径名进行匹配
 * @param {*} routes 路由配置数组
 * @param {*} pathname 路径名
 */
function matchRoutes(routes, pathname) {
    //打平所有的路径分支
    const branches = flattenRoutes(routes);
    //对打平的分支进行排序
    rankRoutesBranches(branches);
    //依次进行分支的匹配
    let matches = null;
    for (let i = 0; matches === null && i < branches.length; i++) {
        matches = matchRouteBranch(branches[i], pathname);
    }
    return matches;
}
/**
 * 对不同的分支按分数进行排序
 * @param {*} branches 
 */
function rankRoutesBranches(branches) {
    branches.sort((a, b) => {
        //如果两个分支分数不同，则直接比较分数，从高到低排列
        //如果两个分支分数相同,则比较索引
        //a /user/add b /user/list
        //a=[/user,add]=[2,0]
        //b=[/user,list]=[2,1]
        return a.score !== b.score ? b.score - a.score : compareIndexes(
            a.routeMetas.map(meta => meta.childrenIndex),
            b.routeMetas.map(meta => meta.childrenIndex)
        )
    });
}
function compareIndexes(a, b) {
    //如果a数组和b数组的长度相同并且除了最后一个索引外，其它索引全相等，说明它们就是兄弟
    let sibling = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
    //如果是兄弟看索引，索引越小的级别越高，如果不是兄弟，认为它们是相等的
    return sibling ? a[a.length - 1] - b[b.length - 1] : 0;

}
/**
 * 匹配路由分支
 * @param {*} branch 分支
 * @param {*} pathname 路径
 */
function matchRouteBranch(branch, pathname) {
    //取出meta数组
    const { routeMetas } = branch;
    //匹配结果的数组
    const matches = [];
    //已经匹配过的路径名
    let matchedPathname = '';
    let matchedParams = {};
    //遍历meta数组
    for (let i = 0; i < routeMetas.length; i++) {
        //取出此meta对应的路由对象
        const { route } = routeMetas[i];
        //判断此meta是不是最后一个
        const end = i === routeMetas.length - 1;
        //用完整路径截掉已经匹配的路径 得到剩下的路径
        const remainingPathname = pathname.slice(matchedPathname.length);
        //把路由对象的路径和剩下待匹配的路径进行匹配，得到匹配的结果
        let match = matchPath({ path: route.path, end }, remainingPathname);
        //如果match为空，直接返回null,表示此路径不通，此支持不能匹配
        if (!match) return null;
        //合并路径参数对象 {}=>{id:100}=>{id:100,age:18}
        matchedParams = Object.assign({}, matchedParams, match.params);
        //把成功匹配到的结果放到matches数组中
        matches.push({ route, params: matchedParams });
        //用上一段匹配的路径加上此route匹配的路径，会成为下一次已经匹配的路径 
        matchedPathname = joinPaths([matchedPathname, match.matchedPathname]);
    }
    return matches;
}
//判断此路径分片是不是通配符*
const isSplat = s => s === '*';
//通配符对应的惩罚分数
const splatPenalty = -2;
//索引路径的值
const indexRouteValue = 2;
//路径参数的正则表达式 :\w+
const paramRegexp = /^:\w+$/;
//路径参数分数是3
const dynamicSegmentValue = 3;
//空串加1
const emptySegmentValue = 1;
//静态字符串就加10分
const staticsSegmentValue = 10;
/**
 * 计算每个路径的分数
 * @param {*} path 路径
 * @param {*} index 它在兄弟之间的位置
 */
function computeScore(path, index) {
    // /user/detail/:id 30
    //把路径用/分割,获取多个路径的分片 /user/detail/:id => ['','user','detail',':id']
    const segments = path.split('/');
    //分片的长度就是初始分类
    let initialScore = segments.length;//4
    //如果某个路径分片是星的话，分数减去2
    if (segments.some(isSplat)) {
        initialScore += splatPenalty;//0
    }
    if (index) {//如果不为0
        initialScore += indexRouteValue;//6
    }
    //6+1+20+3=30
    let score = segments
        .filter(s => !isSplat(s))//过滤*
        .reduce((score, segment) => {
            return score + (
                paramRegexp.test(segment) ? dynamicSegmentValue :
                    segment === '' ? emptySegmentValue : staticsSegmentValue
            )
        }, initialScore);
    return score;
}
/**
 * 把多维变一维，打平所有的分支
 * @param {*} routes 原始的routes数组 [{path,element}]
 * @param {*} branches 分支数组
 * @param {*} parentsMeta 父meta数组
 * @param {*} parentPath  父路径
 */
function flattenRoutes(routes, branches = [], parentMetas = [], parentPath = '') {
    routes.forEach((route, index) => {
        let routeMeta = {
            route,
            childrenIndex: index//此路由在兄弟中的索引位置 
        }
        //获取此route对应的路径
        const routePath = joinPaths([parentPath, route.path]);// /user/add
        //用父metas数组添加上自己的meta构建成一个新的数组
        const routeMetas = [...parentMetas, routeMeta];//[userRouteMeta,userAddRouteMeta]
        if (route.children) {
            //[{add},{list},{detail}],[],[userRouteMeta],/user
            flattenRoutes(route.children, branches, routeMetas, routePath);
        }
        branches.push({
            routePath,//此分支对应的路径
            routeMetas,//此分支对应的路由元信息
            score: computeScore(routePath, index)
        });
    })
    return branches;
}
function joinPaths(paths) {
    return paths.join('/').replace(/\/+/g, '/');
}
/**
 * 把route中的path属性编译成正则表达式
 * @param {*} path 
 */
function compilePath(path, end) {
    //路径参数名的数组
    let paramNames = [];
    let regexpSource = '^' + path
        .replace(/:(\w+)/g, (_, key) => {//  /:id 
            //先把收集到的路径参数名放到数组里暂存
            paramNames.push(key)
            return "([^\/#\?]+?)";
        })
        .replace(/^\/*/, '/')//把开头的0个/,1个/,或多个/全部转成一个/
    if (end) {//如果这个正则是结束的话
        regexpSource += '\\/*$';
    }
    if (path === '*') {
        regexpSource = '.*'
    }
    let matcher = new RegExp(regexpSource);
    return [matcher, paramNames];
}
/**
 * 匹配路由规则中的路径和地址栏中的路径名
 */
function matchPath({ path, end }, pathname) {
    //获取path转换成的正则和路径名的数组
    const [matcher, paramNames] = compilePath(path, end);
    //用路径名匹配正则表达式
    const match = pathname.match(matcher);
    //如果没有匹配成功，则返回null
    if (!match) return null;
    //如果match有值，说明匹配成功了
    const [matchedPathname, ...values] = match;
    let params = paramNames.reduce((memo, paramName, index) => {
        memo[paramName] = values[index]
        return memo;
    }, {});
    return {
        params,//路径参数对象
        matchedPathname,//匹配的路径
    }
}
//定义Route函数式组件，空实现
export function Route() {

}
/**
 * 根据子元素创建路由配置数组
 */
export function createRoutesFromChildren(children) {
    let routes = [];
    //这个是React提供一个工具方法，可以帮你遍历子元素, 可以同时兼容单子元素，子元素数组
    React.Children.forEach(children, ({ props: { path, element, children } }) => {
        //根据子元素创建一个route对象，里面有两个属性
        let route = {
            path,//此路由规则对应的路径
            element//此路径规则对应的要渲染的元素
        }
        //如果此路由还有子路由的话
        if (children) {
            route.children = createRoutesFromChildren(children);
        }
        routes.push(route);
    });
    return routes;
}
export function useNavigate() {
    const { navigator } = React.useContext(NavigationContext);
    let navigate = React.useCallback((to,options={}) => {
        if(options.replace){
            navigator.replace(to);
        }else{
            navigator.push(to);//history.push
        }
    }, [navigator]);
    return navigate;
}

export function Outlet() {
    return useOutlet();
}
function useOutlet() {
    return React.useContext(RouteContext).outlet;//UserDetail这个虚拟DOM元素
}
export function useParams() {
    const { matches } = React.useContext(RouteContext);
    return matches[matches.length - 1].params;
}
export function Navigate({ to, replace = false }) {
    const navigate = useNavigate();
    //为什么此处必须使用useEffect
    //因为要把这个变成一个宏任务
    //先渲染老路径,再变成新的路径，从而触发组件的更新和重新渲染
    //如果使用LayoutEffect的话，那么就直接是新路径
    React.useEffect(() => navigate(to, {
        replace,
    }), [navigate]);
    return null;
}