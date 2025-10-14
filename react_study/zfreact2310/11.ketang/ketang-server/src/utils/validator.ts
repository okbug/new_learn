import validator  from "validator";
export const validateRegisterInput = (
    username:string,password:string,confirmPassword:string,email:string)=>{
   const errors:Record<string,string> = {};
   //判断用户名为是否为空
   if(validator.isEmpty(username)){
    errors.username = '用户名不能为空';
   }   
   //判断用户名的长度是否在3到12之间
   if(!validator.isLength(username,{min:3,max:12})){
    errors.username = '用户名的长度必须在3到12之间';
   }   
   if(validator.isEmpty(password)){
    errors.password = '密码不能为空';
   } 
   if(!validator.equals(password,confirmPassword)){
    errors.confirmPassword = '两次输入的密码不一致';
   }
   if(!validator.isEmail(email)){
    errors.email = '邮箱格式不正确';
   }
   return {
    valid:Object.keys(errors).length===0,//如果全部校验完成后errors是空的，valid就是合法，就是正确 的
    errors
   }
}
export const validateLoginInput = (username:string,password:string)=>{
   const errors:Record<string,string> = {};
   //判断用户名为是否为空
   if(validator.isEmpty(username)){
    errors.username = '用户名不能为空';
   }   
   //判断用户名的长度是否在3到12之间
   if(!validator.isLength(username,{min:3,max:12})){
    errors.username = '用户名的长度必须在3到12之间';
   }   
   if(validator.isEmpty(password)){
    errors.password = '密码不能为空';
   } 
   return {
    valid:Object.keys(errors).length===0,//如果全部校验完成后errors是空的，valid就是合法，就是正确 的
    errors
   }
}