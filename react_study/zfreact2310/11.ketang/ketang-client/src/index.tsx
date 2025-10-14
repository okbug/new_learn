import ReactDOM from 'react-dom/client';
import React from 'react';
import { Routes, Route } from 'react-router-dom'
import './styles/global.less'
const Home = React.lazy(() => import('./views/Home'));
const Cart = React.lazy(() => import('./views/Cart'));
const Profile = React.lazy(() => import('./views/Profile'));
const Detail = React.lazy(() => import('./views/Detail'));
const Register = React.lazy(() => import('./views/Register'));
const Login = React.lazy(() => import('./views/Login'));
import Tabs from './components/Tabs';
import { store, history } from './store';
import { Provider } from 'react-redux';
import { Mask } from 'antd-mobile';
import { HistoryRouter } from 'redux-first-history/rr6';
const rootElement: HTMLElement | null = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!)
root.render(
  <Provider store={store}>
    <HistoryRouter history={history}>
      <React.Suspense fallback={<Mask visible={true}></Mask>}>
        <main className="pt-10 pb-10 w-full">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/detail/:id' element={<Detail />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
          </Routes>
          <Tabs />
        </main>
      </React.Suspense>
    </HistoryRouter>
  </Provider>

);
