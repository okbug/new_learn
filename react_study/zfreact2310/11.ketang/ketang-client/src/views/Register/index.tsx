import NavHeader from "@/components/NavHeader"
import { AppDispatch } from "@/store";
import { Form, Input, Button, Toast } from "antd-mobile";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from '@/store/slices/profile';
const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const handleFinish = async (values: RegisterPayload) => {
        try {
            await dispatch(registerUser(values));
            Toast.show({ icon: 'success', content: '注册成功' });
            navigate('/login');
        } catch (error: any) {
            Toast.show({ icon: 'fail', content: '注册失败' });
        }
    }
    const handleFinishFailed = (errorInfo:any)=>{
        Toast.show({ icon: 'fail', content: `表单校验失败:${errorInfo}` });
    }
    return (
        <>
            <NavHeader>用户注册</NavHeader>
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
                <Form.Item label="确认密码" name="confirmPassword" rules={
                    [{ required: true, message: '请输入你的确认密码' }]
                }>
                    <Input placeholder="确认密码"></Input>
                </Form.Item>
                <Form.Item label="邮箱" name="email" rules={
                    [{ required: true, message: '请输入你的邮箱' }]
                }>
                    <Input placeholder="邮箱"></Input>
                </Form.Item>
                <Form.Item>
                    <div className="text-center mt-2">
                        <Button type="submit" color="primary">注册</Button>
                        或者 <a href="#" onClick={(event) => {
                            event.preventDefault();
                            navigate('/login')
                        }}>立刻登录</a>
                    </div>
                </Form.Item>
            </Form>
        </>
    )
}
export default Register;