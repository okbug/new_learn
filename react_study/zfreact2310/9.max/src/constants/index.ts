const enum RoleCodes {
    root='root',
    admin='admin',
    member='member'
}
const ROLES= [
    {
        code:RoleCodes.root,
        name:'超级管理员'
    },
    {
        code:RoleCodes.admin,
        name:'管理员'
    },
    {
        code:RoleCodes.member,
        name:'普通成员'
    }
]
export {
    RoleCodes,ROLES
}