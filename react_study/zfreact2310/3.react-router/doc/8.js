let routes = (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} >
            <Route path="add" element={<UserAdd />} />
            <Route path="list" element={<UserList />} />
            <Route path="detail/:id" element={<UserDetail />} />
        </Route>
    </Routes>
)
//把上面的多维结构变成一维结构
let branches = [
    {path:'/'},
    {path:'/user'},
    {path:'/user/add'},
    {path:'/user/list'},
    {path:'/user/detail/:id'}
]
//里面还会对分支持排序，简单来说，越长的优先越高
let sortedBranches = [
    {path:'/user/detail/:id'},
    {path:'/user/add'},
    {path:'/user/list'},
    {path:'/'},
    {path:'/user'},
]
//然后进行逐级匹配
let pathname = '/user/add'

