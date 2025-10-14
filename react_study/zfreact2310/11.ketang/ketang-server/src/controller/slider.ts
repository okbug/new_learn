import type {Request,Response} from 'express';
import {Slider} from '../models';
export const list = async (_req:Request,res:Response)=>{
    let sliders = await Slider.find();
    res.json({
        success:true,
        data:sliders
    });
}