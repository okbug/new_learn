export const UserAPI = {
    list() {//获取用户列表
        let usersStr = localStorage.getItem('users');
        let users = usersStr ? JSON.parse(usersStr) : [];
        return users;
    },
    add(user) {//向用户列表中添加用户
        let users = UserAPI.list();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    },
    find(id) {//查找某个id对应的用户对象
        let users = UserAPI.list();
        return users.find(user => user.id == id);
    }
}