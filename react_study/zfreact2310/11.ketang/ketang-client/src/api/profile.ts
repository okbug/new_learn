import axios from './';
export function validate(){
    return axios.get('/user/validate');
}
export function register(payload:RegisterPayload){
    return axios.post('/user/register',payload);
}
export function login(payload:LoginPayload){
    return axios.post('/user/login',payload);
}
export const uploadAvatar = (userId:string,avatar:File)=>{
    const formData = new FormData();
    formData.append('userId',userId);
    formData.append('avatar',avatar,avatar.name);
    return axios.post('/user/uploadAvatar',formData,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    });
}