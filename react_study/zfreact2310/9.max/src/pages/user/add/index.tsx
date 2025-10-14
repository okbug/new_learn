import { Row, Col, Form, Input, Button } from 'antd';
import { useNavigate, useRequest,useModel } from '@umijs/max';
import { addUser } from '@/services/user';
import { useEffect } from 'react';
export default function () {
    const navigate = useNavigate();
    const {refresh} = useModel('user.model');
    const {data,loading,run} =  useRequest(addUser,{
        manual:true,//手工发起请求
        onSuccess:refresh//当添加用户的请求成功之后会调用refresh重新刷新user.model
    });
    const handleFinish = (values) => {
        run(values);
    }
    useEffect(()=>{
        if(data){
            navigate('/user/list');
        }
    },[data]);
    return (
        <Row>
            <Col offset={8} span={8}>
                <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleFinish}>
                    <Form.Item label="用户名" name="username" rules={[{required:true,message:'请输入用户名'}]}><Input/></Form.Item>
                    <Form.Item label="密码" name="password" rules={[{required:true,message:'请输入密码'}]}><Input.Password/></Form.Item>
                    <Form.Item label="手机号" name="phone" rules={[{required:true,message:'请输入手机号'}]}><Input/></Form.Item>
                    <Form.Item wrapperCol={{offset:8,span:16}}>
                        <Button type='primary' htmlType='submit' disabled={loading}>提交</Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    )
}