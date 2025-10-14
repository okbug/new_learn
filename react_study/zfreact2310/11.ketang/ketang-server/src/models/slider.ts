import mongoose, { Schema,Document } from 'mongoose';
export interface ISliderDocument extends Document{
    url:string
}
const SliderSchema:Schema<ISliderDocument> = new  Schema({
    url:String
},{timestamps:true})
export const Slider = mongoose.model<ISliderDocument>('Slider',SliderSchema);