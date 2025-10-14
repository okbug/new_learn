declare namespace API {
    //用户接口
    export interface User{
        id?:number;
        username?:string;
        password?:string;
        phone?:string;
        role?:string;
        avatar?:string;
    }
    //用户列表接口
    export interface ListData<T>{
        list:T[],
        total:number
    }
    export interface ListResponse<T>{
        data:ListData<T>;
        success:boolean,
        errorCode:string,
        errorMessage:string
    }
}