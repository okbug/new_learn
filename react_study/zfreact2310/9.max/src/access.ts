import {RoleCodes} from '@/constants';
export default function(initialState){
    const role = initialState?.currentUser?.role;
    //该方法需要返回一个对象，对象的每一个值就对应定义了一条权限
    return {
        canAddUser:role === RoleCodes.root,
        canLookUserList:role === RoleCodes.root||role === RoleCodes.admin||role === RoleCodes.member,
        canLookUserDetail:role === RoleCodes.root||role === RoleCodes.admin,
        canDeleteUser:role === RoleCodes.root||role === RoleCodes.admin,
    }
}