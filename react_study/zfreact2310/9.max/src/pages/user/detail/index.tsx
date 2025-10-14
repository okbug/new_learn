import {useLocation} from '@umijs/max';
import {Descriptions} from 'antd';
export default function(){
    const location = useLocation();
    let user = location.state as API.User;
    return (
        <Descriptions title="用户信息">
            <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
            <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>
        </Descriptions>
    )
}