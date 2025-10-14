import Home from './components/Home';
import User from './components/User';
import UserAdd from './components/UserAdd';
import UserList from './components/UserList';
import UserDetail from './components/UserDetail';
import Profile from './components/Profile';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Protected from './components/Protected';
const routes = [
    { path: '/', element: <Home /> },
    {
        path: '/user', element: <User />,
        children: [
            { path: 'add', element: <UserAdd /> },
            { path: 'list', element: <UserList /> },
            { path: 'detail/:id', element: <UserDetail /> },
        ]
    },
    { path: '/profile', element: <Protected RouteComponent={Profile} from="/profile" /> },
    { path: '/login', element: <Login /> },
    { path: '*', element: <NotFound /> }
]
export default routes;