import {request} from '@umijs/max';
export async function get<T>(url){
    return request<T>(url,{method:'GET'});
}
export async function post<T>(url:string,body:T){
    return request(url,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        data:body
    });
}
export async function del(url:string){
    return request(url,{method:'DELETE'});
}