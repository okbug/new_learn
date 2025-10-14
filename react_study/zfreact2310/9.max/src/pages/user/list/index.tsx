
import {List,Button} from 'antd';
import {Link,useModel,useRequest,useAccess} from '@umijs/max';
import {deleteUser} from '@/services/user';
export default function(){
    const {data,loading,refresh} = useModel('user.model');
    const {run} = useRequest(deleteUser,{
      manual:true,
      onSuccess:refresh
    });
    const access = useAccess();

    return (
        <List
          loading={loading}
          header={<div>用户列表</div>}
          footer={<div>共计{data?.total}</div>}
          bordered
          dataSource={data?.list}
          renderItem={(user:API.User)=>{
            return (
                <List.Item>
                    <Link to={`/user/detail/${user.id}`} state={user}>{user.username}</Link>
                    <Button
                      size='small'
                      type='primary'
                      disabled={!access.canDeleteUser}
                      loading={loading}
                      onClick={()=>run(user.id as number)}
                    >删除</Button>
                </List.Item>
            )
          }}
        />
    )
}