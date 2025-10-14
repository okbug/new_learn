import {get,post,del} from './';

export async function getUser(){
    return get<API.ListResponse<API.User>>('/api/user');
}
export async function addUser(body:API.User){
    return post<API.User>('/api/user',body);
}
export async function signup(body:API.User){
    return post<API.User>('/api/user',body);
}
export async function signin(body:API.User){
    return post<API.User>('/api/signin',body);
}
export async function deleteUser(id:number){
    return del(`/api/user/${id}`);
}