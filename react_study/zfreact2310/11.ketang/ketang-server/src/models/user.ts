import mongoose, { Schema,Document,Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export interface IUserDocument extends Document{
   username:string;//用户名
   password:string;//密码
   email:string;//邮箱
   avatar:string;//头像
   generateToken:()=>string;
}
const UserSchema = new  Schema<IUserDocument>({
    username:{
        type:String,//类型是字符串
        required:[true,'用户名不能为空'],//必填项，必须提供用户名
        minLength:[3,'最小长度是3'],//最小长度为3
        maxLength:[12,'最大长度为12']//最大长度为12
    },
    password:{type:String,required:true},//密码
    avatar:String,//头像
    email:{//邮箱
        type:String,
        required:true,
        trim:true,//保存时去掉前后的空格
        validate:[validator.isEmail,'请输入合法的邮箱地址']
    }
},{timestamps:true,toJSON:{
    //把原始的mongoose文档对象转成JSON对象的时候会走此转换方法
    transform(doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;//这个字段是mongoose中用来实现并发处理的校验
        delete ret.password;//密码也删除
        return ret;
    },
}})
//编写一个预保存的中间件
//此函数会在第一次保存文档对象之前执行,处理完之后再调用next方法继续完成保存
UserSchema.pre('save',async function(next){
    //如果本次保存的时候密码没有变，直接继续 this指的是文档对象
    if(!this.isModified('password'))return next();
    //如果是第一次保存或者说密码变了，则要重新计算hash密码
    this.password = await bcrypt.hash(this.password,10);
    next();
})
//为模型扩展一个静态方法，静态方法指的是不需要实例化，只通过模型就可以调用
UserSchema.statics.login = async function(username,password){
    //先按用户名进行查询 
    const user = await this.findOne({username});
    //如果用户存在，并且用户输入的密码和数据库里的密码进行匹配
    if(user && await bcrypt.compare(password,user.password)){
        return user;
    }
    return null;
}
//给用户这个文档对象添加一个实例方法
//login放在静态上，这个生成token放在methods上有什么区别么
//login是静态方法，是通过模型来调用的
//methods是实例方法，则通过具体的文档对象来调用的
UserSchema.methods.generateToken = function(){
    //先创建一个 payload
    const payload = {id:this._id};
    //根据payload生成签名token
    return jwt.sign(payload,process.env.JWT_SECRET_KEY!,{expiresIn:'1h'})
}
interface IUserModel<T extends Document> extends Model<T>{
    login:(username:string,password:string)=>IUserDocument|null
}
export const User = mongoose.model<IUserDocument,IUserModel<IUserDocument>>('User',UserSchema);
//const user = new User();
//const user = User.findOne();
//user.generateToken
