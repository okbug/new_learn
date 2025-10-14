import { useEffect ,useState} from 'react';
import NavHeader from '@/components/NavHeader'
import { RootState } from '@/store';
import { ProfileState,validateLoginState,logout,uploadUserAvatar } from '@/store/slices/profile';
import { useDispatch, useSelector } from 'react-redux';
import { Mask, Result, Button, List,Toast, ImageUploader } from 'antd-mobile'
import { useNavigate } from 'react-router-dom';
import {LOGIN_STATE} from '@/types/constants';
import {AppDispatch} from '@/store';
function Profile() {
    const { loginState,user } = useSelector<RootState, ProfileState>(state => state.profile);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [fileList,setFileList] = useState(()=>user?.avatar?[{url:user.avatar}]:[]);
    useEffect(()=>{
        if(loginState === LOGIN_STATE.UN_VALIDATE){
            dispatch(validateLoginState())
        }
       /*  (async function(){
            if(loginState === LOGIN_STATE.UN_VALIDATE){
                const user = await dispatch(validateLoginState()).unwrap()
                setFileList([{url:user.avatar}])
            }
        })()  */
    },[loginState]);
    useEffect(()=>{
        if(user?.avatar){
            setFileList([{url:user.avatar}])
        }
    },[user]);
    const handleLogout = ()=>{
        dispatch(logout())
        Toast.show({icon:'success',content:'已退出登录'})
        navigate('/login');
    }
    let content = null;
    const beforeUpload = (file:File)=>{
        const isLessonThan2M = file.size/1024/1024<2;
        if(!isLessonThan2M){
            Toast.show({icon:'fail',content:'图片必须小于2M'})
            return null;
        }
        return file
    }
    const handleUpload:any = async (avatar:File)=>{
        if(!user)return;
        const url = await dispatch(uploadUserAvatar({userId:user.id,avatar})).unwrap();
        return {url};
    }
    const renderUserInfo = () => (
        <div className='p-5'>
            <List>
                <List.Item extra={user?.username}>用户名</List.Item>
                <List.Item extra={user?.email}>邮箱</List.Item>
                <List.Item extra={
                    <ImageUploader
                      value={fileList}
                      maxCount={1}
                      accept='image/*'
                      imageFit='cover'
                      beforeUpload={beforeUpload}
                      upload={handleUpload}
                    />
                }>头像</List.Item>
            </List>
            <Button color='warning' onClick={handleLogout}>退出登录</Button>
        </div>
    )
    const renderLoginPrompt = () => (
        <Result
            status='warning'
            title='亲爱的用户你好，你尚未登录，请注册或者登录'
            description={
                <div className='text-center p-12'>
                    <Button color='primary' onClick={() => navigate('/login')}>登录</Button>
                    <Button color='default' style={{marginLeft:'50px'}} onClick={() => navigate('/register')}>注册</Button>
                </div>
            }
        />
    )
    switch (loginState) {
        case LOGIN_STATE.UN_VALIDATE:
            content = <Mask />
            break;
        case LOGIN_STATE.LOGIN_ED:
            content = renderUserInfo();
            break;
        case LOGIN_STATE.UN_LOGIN:
            content = renderLoginPrompt();
            break;
        default:
            break;
    }
    return (
        <section>
            <NavHeader></NavHeader>
            {content}
        </section>
    )
}
export default Profile;