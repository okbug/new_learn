import {Link,history,useNavigate} from '@umijs/max';
import {Button} from 'antd';
export default function Page() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className={`text-lg font-bold text-red-600`}>首页</h1>
      <Link to="/profile">个人中心</Link>
      <Button type='primary' onClick={()=>history.push('/profile')}>个人中心</Button>
      <Button type='primary' onClick={()=>navigate('/profile')}>个人中心</Button>
    </div>
  );
}
