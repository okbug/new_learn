import {useRequest} from '@umijs/max';
import {getUser} from '@/services/user';
export default ()=>{
    //data获取的响应数据
    //loading是否正请求中
    //refresh调用此refresh方法可以重新发起请求
    const {data,loading,refresh} = useRequest(getUser);//{list,total}
    return {
        data,
        loading,
        refresh
    }
}