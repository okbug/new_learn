import NavHeader from "@/components/NavHeader"
import { AppDispatch } from "@/store";
import { Form, Input, Button, Toast } from "antd-mobile";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from '@/store/slices/profile';
const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const handleFinish = async (values: LoginPayload) => {
        try {
            await dispatch(loginUser(values));
            Toast.show({ icon: 'success', content: '登录成功' });
            navigate('/');
        } catch (error: any) {
            Toast.show({ icon: 'fail', content: '登录失败' });
        }
    }
    const handleFinishFailed = (errorInfo:any)=>{
      Toast.show({ icon: 'fail', content: `表单校验失败:${errorInfo}` });
    }
    return (
        <>
            <NavHeader>用户登录</NavHeader>
            <Form
                onFinish={handleFinish}
                onFinishFailed={handleFinishFailed}
            >
                <Form.Item label="用户名" name="username" rules={
                    [{ required: true, message: '请输入你的用户名' }]
                }>
                    <Input placeholder="用户名"></Input>
                </Form.Item>
                <Form.Item label="密码" name="password" rules={
                    [{ required: true, message: '请输入你的密码' }]
                }>
                    <Input placeholder="密码"></Input>
                </Form.Item>
                <Form.Item>
                    <Button type="submit" color="primary">登录</Button>
                    <span className="text-center ml-4">
                        或者<a href="#" onClick={(event) => {
                            event.preventDefault();
                            navigate('/register')
                        }}>立刻注册</a>
                    </span>
                </Form.Item>
            </Form>
        </>
    )
}
export default Login;