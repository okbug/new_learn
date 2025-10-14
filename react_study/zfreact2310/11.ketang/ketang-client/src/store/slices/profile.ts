import { validate,register,login,uploadAvatar } from '@/api/profile';
import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import {LOGIN_STATE} from '@/types/constants';
export interface ProfileState{
  loginState:LOGIN_STATE;//登录的状态
  user:User|null;        //登录的用户
  error:any              //错误信息
}
//初始状态
const initialState:ProfileState = {
    loginState:LOGIN_STATE.UN_VALIDATE,
    user:null,
    error:null
}
export const validateLoginState = createAsyncThunk('validateLoginState',async (_,{rejectWithValue})=>{
    try{
        const response = await validate();
        return response.data;
    }catch(error:any){
        return rejectWithValue(error.response.data);
    }
});
export const registerUser = createAsyncThunk('registerUser',
    async (payload:RegisterPayload,{rejectWithValue})=>{
    try{
        const response = await register(payload);
        return response.data;
    }catch(error:any){
        return rejectWithValue(error.response.data);
    }
});
export const loginUser = createAsyncThunk('loginUser',
    async (payload:LoginPayload,{rejectWithValue})=>{
    try{
        const response = await login(payload);
        return response.data;
    }catch(error:any){
        return rejectWithValue(error.response.data);
    }
});
export const uploadUserAvatar = createAsyncThunk('uploadAvatar',
    async ({userId,avatar}:{userId:string,avatar:File},{rejectWithValue})=>{
    try{
        const response = await uploadAvatar(userId,avatar);
        return response.data;
    }catch(error:any){
        return rejectWithValue(error.response.data);
    }
});
const slice = createSlice({
    name:'profile',
    initialState,
    reducers:{
        logout(state){//退出登录
            state.user = null;
            state.loginState = LOGIN_STATE.UN_LOGIN;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(validateLoginState.fulfilled,(state,action)=>{
            state.loginState = LOGIN_STATE.LOGIN_ED;//把登录状态改为登录成功
            state.user = action.payload;//把用户设置为登录的用户
            state.error= null;//把错误设置为null
        })
        .addCase(validateLoginState.rejected,(state,action)=>{
            state.loginState = LOGIN_STATE.UN_LOGIN;//把登录状态改为未登录
            state.user = null;//用户信息为null
            state.error= action.error;//设置错误对象
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
           
        })
        .addCase(registerUser.rejected,(state,action)=>{
           
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
           const {user,token}= action.payload;
           localStorage.setItem('token',token);
           state.user = user;
           state.error = null;
           state.loginState = LOGIN_STATE.LOGIN_ED;
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.user = null;
            state.error = action.error;
            state.loginState = LOGIN_STATE.UN_LOGIN;
        });
    }
})
export const {logout} = slice.actions;
export default slice.reducer;