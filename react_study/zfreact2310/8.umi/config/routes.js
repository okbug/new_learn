const routes = [
    {path:'/',component:'@/pages/index.js'},
    {
        path:'/user',
        component:'@/pages/user/index.js',
        routes:[
            {path:'list',component:'@/pages/user/list'},
            {path:'add',component:'@/pages/user/add'},
            {path:'detail/:id',component:'@/pages/user/detail.js'},
        ]
    },
    {
        path:'/profile',
        component:'@/pages/profile.js',
        wrappers:[
            '@/wrappers/auth'
        ]
    },
    {
        path:'/login',
        component:'@/pages/login.js'
    }
]
export default routes;