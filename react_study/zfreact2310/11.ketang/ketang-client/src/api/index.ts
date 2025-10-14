import axios from 'axios';
import type {AxiosResponse} from 'axios';
//设置发请请求时的默认地址前缀 
axios.defaults.baseURL = 'http://localhost:9898';
//设置默认发POST请求的时候携带内容类型为JSON
axios.defaults.headers.post['Content-Type']='application/json;charset=UTF-8';
axios.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers=config.headers||{};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error)
    }
);
axios.interceptors.response.use(
    (response:AxiosResponse)=>{
        return response.data;//本来response是包装后的响应，{headers,data}.这里取出来data,得到就是响应体了
    },
    (error)=>{
        return Promise.reject(error)
    }
)
export default axios;