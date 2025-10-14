import { createSlice } from "@reduxjs/toolkit"
import { useContext, useEffect, useReducer } from "react";
import { ReactReduxContext } from 'react-redux';
const FETCH_DATA = 'FETCH_DATA';
/**
 * 基于fetch实现的请求方法，类似于umi中的request
 * @param {*} baseUrl基本的url地址 
 * @returns baseQuery
 */
function fetchBaseQuery({ baseUrl }) {
    return (url) => fetch(baseUrl + url)
}
/**
 * 创建API
 * @param {*} reducerPath 处理路径
 * @param {*} baseQuery 基本的查询方法
 * @param {*} endpoints 接口或者说端点的集合
 */
function createApi({ reducerPath, baseQuery, endpoints }) {
    //在此创建一个分片
    const slice = createSlice({
        name: reducerPath,//切片名称
        initialState: { data: undefined, error: undefined, isLoading: false },//初始状态
        reducers: {
            setValue(state, { payload }) {//设置或者说修改状态dispatch({type:'todos/setValue',payload:{}})
                for (const key in payload) {
                    state[key] = payload[key];
                }
            }
        }
    });
    const builder = {
        query({ query }) {
            function useQuery(...args) {
                const { store } = useContext(ReactReduxContext);
                const [,forceUpdate] = useReducer(x=>x+1,0);
                useEffect(() => {
                    const url = query(...args);
                    //向仓库派发一个动作，表示希望请求此url的接口,并用返回值来更新状态
                    store.dispatch({ type: FETCH_DATA, payload: { url } });
                    //监听仓库的状态变化，当仓库的状态发生变化后更新当前的组件
                    return store.subscribe(forceUpdate);
                },[]);
                const state = store.getState();
                return state[reducerPath];
            }
            return { useQuery };
        }
    }
    return {
        reducerPath,//合并reducer属性名
        reducer: slice.reducer,
        endpoints: endpoints(builder),
        middleware: ({ dispatch }) => {//中间件来拦截用户请发的FETCH_DATA动作，进行接口的请求并更新状态
            return function (next) {
                return function (action) {
                    if (action.type === FETCH_DATA) {
                        const { url } = action.payload;
                        (async function () {
                            //在接口请求前先派发一个动作，让状态isLoading设置为true
                            dispatch(slice.actions.setValue({ isLoading: true }));
                            try {
                                //发起真正的请求
                                const response = await baseQuery(url);
                                //获取服务器返回的状态码
                                const { status,data } = response;
                                //获取服务器返回的响应体
                                if (status >= 200 && status < 300) {
                                    dispatch(slice.actions.setValue(
                                        { isLoading: false, error: undefined, data }));
                                } else {
                                    dispatch(slice.actions.setValue(
                                        { isLoading: false, 
                                            error: {data}, data: undefined }));
                                }
                            } catch (error) {
                                dispatch(slice.actions.setValue(
                                    { isLoading: false, error:{data:error}, data: undefined }));
                            }
                        })();
                    } else {
                        return next(action)
                    }
                }
            }
        }
    }
}
export {
    createApi,
    fetchBaseQuery
}