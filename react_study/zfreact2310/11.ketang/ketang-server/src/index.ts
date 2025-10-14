import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import statusCodes from 'http-status-codes';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import HttpException from './exceptions/HttpException';
import * as sliderController from './controller/slider'
import * as lessonController from './controller/lesson'
import * as userController from './controller/user'
import {Slider,Lesson} from './models';
import type { Request,Response,NextFunction } from 'express';
dotenv.config();//寻找当前目录下面的.env文件，然后把里面的内容写入环境变量
const storage = multer.diskStorage({
  //指定上传的目录路径
  destination:path.join(__dirname,'public','uploads'),
  filename(_req:Request,file:Express.Multer.File,cb){
    //指定保存的文件名
    const filename = uuidv4()+path.extname(file.originalname)
    cb(null,filename)
  }
})
const upload = multer({storage});
const app = express();
app.use(cors())
app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.resolve(__dirname,'public'),{
  setHeaders(res){
    res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
  }
}));
app.get('/slider/list',sliderController.list);
app.get('/lesson/list',lessonController.list);//获取课程列表
app.get('/lesson/:id',lessonController.get);//根据课程ID获取某个课程详情对象
app.post('/user/register',userController.register);
app.post('/user/login',userController.login);
app.get('/user/validate',userController.validate);//验证用户是否登录
app.post('/user/uploadAvatar',upload.single('avatar'),userController.uploadAvatar);
app.use((_req:Request,_res:Response,next:NextFunction)=>{
    next(new HttpException(404,'页面不存在'));
});
//错误处理中间件
app.use((error:HttpException,_req:Request,res:Response,_next:NextFunction):void=>{
    res
    .status(error.status||statusCodes.INTERNAL_SERVER_ERROR)
    .send({
        success:false,
        message:error.message,
        errors:error.errors
    });
});
const PORT = 9898;
(async function(){
    const dbURL= 'mongodb://127.0.0.1/ketang';
    await mongoose.connect(dbURL);
    await initializeSliders();
    await initializeLessons();
    app.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));
})();

async function initializeSliders(){
    const count = await Slider.countDocuments();
    if(count===0){
        Slider.create([
            { url: 'http://img.zhufengpeixun.cn/post_reactnative.png' },
            { url: 'http://img.zhufengpeixun.cn/post_react.png' },
            { url: 'http://img.zhufengpeixun.cn/post_vue.png' },
            { url: 'http://img.zhufengpeixun.cn/post_wechat.png' },
            { url: 'http://img.zhufengpeixun.cn/post_architect.jpg' }
        ]);
    }
}
async function initializeLessons() {
    const lessons = await Lesson.find();
    if (lessons.length == 0) {
      const lessons: any = [
        {
          order: 1,
          title: "1.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥100.00元",
          category: "react",
        },
        {
          order: 2,
          title: "2.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥200.00元",
          category: "react",
        },
        {
          order: 3,
          title: "3.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥300.00元",
          category: "react",
        },
        {
          order: 4,
          title: "4.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥400.00元",
          category: "react",
        },
        {
          order: 5,
          title: "5.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥500.00元",
          category: "react",
        },
        {
          order: 6,
          title: "6.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥100.00元",
          category: "vue",
        },
        {
          order: 7,
          title: "7.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥200.00元",
          category: "vue",
        },
        {
          order: 8,
          title: "8.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥300.00元",
          category: "vue",
        },
        {
          order: 9,
          title: "9.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥400.00元",
          category: "vue",
        },
        {
          order: 10,
          title: "10.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥500.00元",
          category: "vue",
        },
        {
          order: 11,
          title: "11.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥600.00元",
          category: "react",
        },
        {
          order: 12,
          title: "12.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥700.00元",
          category: "react",
        },
        {
          order: 13,
          title: "13.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥800.00元",
          category: "react",
        },
        {
          order: 14,
          title: "14.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥900.00元",
          category: "react",
        },
        {
          order: 15,
          title: "15.React全栈架构",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/react_poster.jpg",
          url: "http://img.zhufengpeixun.cn/react_url.png",
          price: "¥1000.00元",
          category: "react",
        },
        {
          order: 16,
          title: "16.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥600.00元",
          category: "vue",
        },
        {
          order: 17,
          title: "17.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥700.00元",
          category: "vue",
        },
        {
          order: 18,
          title: "18.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥800.00元",
          category: "vue",
        },
        {
          order: 19,
          title: "19.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥900.00元",
          category: "vue",
        },
        {
          order: 20,
          title: "20.Vue从入门到项目实战",
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://img.zhufengpeixun.cn/vue_poster.png",
          url: "http://img.zhufengpeixun.cn/vue_url.png",
          price: "¥1000.00元",
          category: "vue",
        },
      ];
      Lesson.create(lessons);
    }
  }