import {useEffect} from 'react';
import { RootState } from "@/store";
import { HomeState,setLessonsLoading,resetLessons,addMoreLessons } from "@/store/slices/home";
import { useDispatch, useSelector, useStore } from "react-redux";
import {getLessons} from '@/api/home';
const useLessons = ()=>{
    const {currentCategory,lessons} = useSelector<RootState,HomeState>((state:RootState)=>state.home);
    const store = useStore<RootState>();
    const dispatch = useDispatch()
    //是用来初次加载第一页的数据的
    const initLessons = ()=>{
        //在重新获取数据的时候要重新获取仓库中最新的状态
        const {currentCategory,lessons:{loading,limit}} = store.getState().home;
        //如果正在请求当中则直接返回
        if(loading)return;
        dispatch(setLessonsLoading(true));//先把loading设置为true
        //调用获取课程列表的接口获取课程列表数据
        getLessons(currentCategory,0,limit)
        .then(({data})=>{
            dispatch(resetLessons(data))
        }).finally(()=>dispatch(setLessonsLoading(false)))
    }
    //加载后面的页码对应的课程列表，加载下一页
    const fetchMoreLessons = ()=>{
        //在重新获取数据的时候要重新获取仓库中最新的状态
        const {currentCategory,lessons:{loading,hasMore,offset,limit}} = store.getState().home;
        //如果正在请求当中则直接返回 或者已经没有更多了
        if(loading||!hasMore)return;
        dispatch(setLessonsLoading(true));//先把loading设置为true
        //调用获取课程列表的接口获取课程列表数据
        getLessons(currentCategory,offset,limit)
        .then(({data})=>{
            dispatch(addMoreLessons(data))
        }).finally(()=>dispatch(setLessonsLoading(false)))
    }
    useEffect(initLessons,[currentCategory]);
    return {
        lessons,
        fetchMoreLessons,
        initLessons
    }
}
export default useLessons;