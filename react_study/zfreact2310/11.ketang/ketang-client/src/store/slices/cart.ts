import { createSlice,PayloadAction } from '@reduxjs/toolkit';
export interface CartLesson{
    lesson:Lesson;
    count:number;
    checked:boolean;
}
export type CartState = Array<CartLesson>
const initialState:CartState =[]
type addCartItemAction = PayloadAction<Lesson>
export type ChangeCountPayload = {id:string,count:number};
const slice = createSlice({
    name:'cart',
    initialState,
    reducers:{
        addCartItem(state:CartState,action:addCartItemAction){
            const index = state.findIndex(item=>item.lesson.id ===action.payload.id);
            if(index !==-1){//如果说购物车中已经有此商品了，则添加一个数量
                state[index].count+=1;
            }else{//如果现在购物车还没有此商品，则向购物车中添加一个新的商品
                state.push({checked:false,count:1,lesson:action.payload});
            }
        },
        //传递新的选中的购物车条目对应的课程ID数组
        changeCheckedCartItems(state:CartState,action:PayloadAction<string[]>){
            state.forEach(item=>{
                item.checked = action.payload.includes(item.lesson.id);
            });
        },
        clearCartItems(){
            return [];
        },
        settle(state){
            return state.filter(item=>!item.checked);
        },
        removeCartItem(state:CartState,action:PayloadAction<string>){
            return state.filter(item=>item.lesson.id !== action.payload);
        },
        changeCartItemCount(state:CartState,action:PayloadAction<ChangeCountPayload>){
            //先找到此商品对应的条目
            const item = state.find(item=>item.lesson.id === action.payload.id);
            //再把此条目对应的商品的数量修改为传过来的数量
            if(item) item.count = action.payload.count;
        }
    }
})
export const {
    addCartItem,
    changeCheckedCartItems,
    clearCartItems,
    settle,
    removeCartItem,
    changeCartItemCount
} = slice.actions;
export default slice.reducer;