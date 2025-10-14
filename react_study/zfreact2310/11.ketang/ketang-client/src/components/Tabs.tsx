import React from 'react';
import { NavLink,NavLinkProps } from 'react-router-dom';
import { HomeOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
const defaultClassNames = 'flex flex-1 flex-col justify-center items-center ';
type ClassName = NavLinkProps['className'];
const getClassName:ClassName = (props) => props.isActive ? defaultClassNames +'text-orange-500 font-bold'
    : defaultClassNames+'text-black'
const Tabs: React.FC = () => {
    return (
        <footer
            className='z-50 fixed left-0 bottom-0 w-full h-10 bg-white border-t border-gray-300  flex justify-center items-center'
        >
            <NavLink to="/" className={getClassName}>
                <HomeOutlined className='text-base' />
                <span className='text-xs'>首页</span>
            </NavLink>
            <NavLink to="/cart" className={getClassName}>
                <ShoppingCartOutlined className='text-base' />
                <span className='text-xs'>购物车</span>
            </NavLink>
            <NavLink to="/profile" className={getClassName}>
                <UserOutlined className='text-base' />
                <span className='text-xs'>个人中心</span>
            </NavLink>
        </footer>
    )
}
export default Tabs;