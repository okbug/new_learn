import { createSlice } from '@reduxjs/toolkit';
export interface Lessons {
    loading:boolean;//如果正在请求课程列表接口，则为true,否则为false
    list:Array<Lesson>;//这是仓库中保存的真正的课程列表
    hasMore:boolean;//是否是否有更多的数据
    offset:number;//表示下次请求时的偏移量0,5
    limit:number;//每页的条数
}
export interface HomeState{
    currentCategory:string;
    sliders:Array<Slider>,
    lessons:Lessons
}
const initialState:HomeState = {
    currentCategory:'all',
    sliders:[],
    lessons:{
        loading:false,
        list:[],
        hasMore:true,
        offset:0,
        limit:5
    }
}
interface ChangeCategoryAction{
    type:string;
    payload:string
}
interface SetSliderAction{
    type:string;
    payload:Array<Slider>
}
interface SetLessonsLoadingAction{
    type:string;
    payload:boolean;
}
interface ResetLessonsAction{
    type:string;
    payload:{
        hasMore:boolean;//是否是否有更多，也就是说是否不是最后一页
        list:Array<Lesson>//当页的课程列表
    };
}
interface AddMoreLessonsAction{
    type:string;
    payload:{
        hasMore:boolean;//是否是否有更多，也就是说是否不是最后一页
        list:Array<Lesson>//当页的课程列表
    };
}
const slice = createSlice({
    name:'home',
    initialState,
    reducers:{
        changeCurrentCategory(state:HomeState,action:ChangeCategoryAction){
            state.currentCategory=action.payload;
        },
        setSliders(state:HomeState,action:SetSliderAction){
            state.sliders = action.payload;
        },
        setLessonsLoading(state:HomeState,action:SetLessonsLoadingAction){
            state.lessons.loading = action.payload;
        },
        resetLessons(state:HomeState,action:ResetLessonsAction){
            state.lessons.list = action.payload.list;//重置课程列表
            state.lessons.hasMore = action.payload.hasMore;//是否更有更多
            state.lessons.offset = action.payload.list.length;//取下页数据时的偏移
        },
        addMoreLessons(state:HomeState,action:AddMoreLessonsAction){
            state.lessons.list = [...state.lessons.list,...action.payload.list];//合并课程列表
            state.lessons.hasMore = action.payload.hasMore;//是否更有更多
            state.lessons.offset = state.lessons.offset+action.payload.list.length;//取下页数据时的偏移
        }
    }
})
export default slice.reducer;
export const {changeCurrentCategory,setSliders,setLessonsLoading,resetLessons,addMoreLessons} = slice.actions;