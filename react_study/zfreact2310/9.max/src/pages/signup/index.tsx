import { Row, Col, Form, Input, Button, Card,Select } from 'antd';
import { Link ,useRequest,history} from '@umijs/max';
import { signup } from '@/services/user';
import {ROLES} from '@/constants'
export default function () {
    const {loading,run} =  useRequest(signup,{
        manual:true,//手工触发
        onSuccess(){//注册成功后跳转到登录页面
            history.push('/signin');
        }
    });
    const handleFinish = (values) => {
        run(values);
    }
    return (
        <Row className='h-screen bg-gray-200' align='middle'>
            <Col offset={8} span={8}>
                <Card title="请注册" extra={<Link to="/signin">去登录</Link>}>
                    <Form labelCol={{ span:4 }} wrapperCol={{ span: 20}} onFinish={handleFinish}>
                        <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}><Input /></Form.Item>
                        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}><Input.Password /></Form.Item>
                        <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}><Input /></Form.Item>
                        <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
                            <Select>
                                {
                                    ROLES.map(role=>(
                                        <Select.Option value={role.code}>
                                            {role.name}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type='primary' htmlType='submit' disabled={loading}>提交</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}