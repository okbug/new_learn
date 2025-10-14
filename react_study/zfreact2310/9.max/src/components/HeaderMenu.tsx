import { useModel, history } from '@umijs/max'
import { Dropdown, Avatar, Space } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
function HeaderMenu() {
    const { initialState, setInitialState } = useModel('@@initialState');
    const handleMenuClick: MenuProps['onClick'] = (event) => {
        localStorage.removeItem('token');
        history.push('/signin');
        setInitialState({ currentUser: null });
    };
    const items: MenuProps['items'] = [
        {
            key: 'logout',
            label: <span>退出</span>,
            icon: <LogoutOutlined />,
        }
    ];
    const menuProps = {
        items,
        onClick: handleMenuClick,
    };
    return (
        initialState?.currentUser ? (
            <Dropdown.Button menu={menuProps}>
                <Space>
                    <Avatar size={16} src={initialState?.currentUser?.avatar} />
                    <span> {initialState?.currentUser?.username}</span>
                </Space>
            </Dropdown.Button>
        ) : <span></span>
    )
}
export default HeaderMenu;