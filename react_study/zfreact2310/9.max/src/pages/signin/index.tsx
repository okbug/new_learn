import { Row, Col, Form, Input, Button, Card, Select } from 'antd';
import { Link, useRequest, history, useModel } from '@umijs/max';
import { signin } from '@/services/user';
import { decode } from 'jsonwebtoken';
import { useEffect } from 'react';
export default function () {
    const { initialState, setInitialState } = useModel('@@initialState');
    const { loading, run } = useRequest(signin, {
        manual: true,//手工触发
        onSuccess(result) {//注册成功后跳转到登录页面
            //把登录成功后服务器返回的JWTToken保存在本地
            localStorage.setItem('token', result);
            const currentUser = decode(result);
            setInitialState({ currentUser });
        }
    });
    useEffect(() => {
        if (initialState?.currentUser) {
            history.push('/');
        }
    }, [initialState]);
    const handleFinish = (values) => {
        run(values);
    }
    return (
        <Row className='h-screen bg-gray-200' align='middle'>
            <Col offset={8} span={8}>
                <Card title="请登录" extra={<Link to="/signup">去注册</Link>}>
                    <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onFinish={handleFinish}>
                        <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}><Input /></Form.Item>
                        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}><Input.Password /></Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type='primary' htmlType='submit' disabled={loading}>提交</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}