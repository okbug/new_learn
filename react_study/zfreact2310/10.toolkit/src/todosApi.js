import {createApi,fetchBaseQuery} from './@reduxjs/toolkit/query/react';
import axios from 'axios';
function axiosBaseQuery({ baseUrl }) {
    return async (url) => {
        try{
            const response = await axios({url:baseUrl + url})
            return {status:response.status,data:response.data}
        }catch(error){
            return {
                status:error.response.status,
                data:error.message
            }
        }
    }
}
const todosApi = createApi({
    reducerPath:'todos',//在合并reducer的时候属性名
    baseQuery:axiosBaseQuery({baseUrl:'http://localhost:8080'}),
    endpoints:(builder)=>{//指的就是不同的路由接口
        //允许你定义endpoint的集合用来描述如何获取数据
        return {
            getTodos:builder.query({query:()=>`/todos/list`}),
            getTodo:builder.query({query:(id)=>`/todos/detail/${id}`}),
            addTodo:builder.query({
                query: (body) => ({
                    url: `/todos`,
                    method: 'POST',
                    body
                  })
            })
        }
    }
});
export default todosApi;