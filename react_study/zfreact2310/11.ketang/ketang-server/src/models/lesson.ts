import mongoose, { Schema,Document } from 'mongoose';
export interface ILessonDocument extends Document{
    order:number;//顺序号
    title:string;//标题
    video:string;//视频地址
    poster:string;//海报
    url:string;//url地址
    price:string;//价格
    category:string;//课程的分类
}
const LessonSchema:Schema<ILessonDocument> = new  Schema({
    order:Number,//顺序号
    title:String,//标题
    video:String,//视频地址
    poster:String,//海报
    url:String,//url地址
    price:String,//价格
    category:String,//课程的分类
},{timestamps:true,toJSON:{
    transform(_doc,ret:Record<string, any>){//把mongo对象转成普通的JS中的JSON对象的时候可以使用此方法进行转换
        ret.id =_doc._id;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    }   
}})
export const Lesson = mongoose.model<ILessonDocument>('Lesson',LessonSchema);