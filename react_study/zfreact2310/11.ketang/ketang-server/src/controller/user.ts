import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models';
import { validateRegisterInput, validateLoginInput } from '../utils/validator';
import HttpException from '../exceptions/HttpException';
import {UserPayload} from '../typings/jwt';
import jwt from 'jsonwebtoken';
export const register = async (req: Request, res: Response, next: NextFunction) => {
    let { username, password, confirmPassword, email } = req.body;
    try {
        const { valid, errors } = validateRegisterInput(username, password, confirmPassword, email)
        if (!valid) {
            throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, '参数校验失败', errors);
        }
        let user = new User({
            username,
            password,
            email
        });
        //判断此用户名是否数据库中已经存在，如果已经存在提示用户名重复？
        //把此文档实例保存到数据库中
        await user.save();
        res.json({
            success: true,
            data: user.toJSON()//data里可以是保存成功之后的文档 对象，也可以返回data为空
        })
    } catch (error) {
        next(error)
    }
}
export const login = async (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;
    try {
        const { valid, errors } = validateLoginInput(username, password)
        if (!valid) {
            throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, '参数校验失败', errors);
        }
        const user = await User.login(username, password);
        //其实在登录成功后要向客户端返回token,代表用户的权限
        if (user) {
            const token = user.generateToken();
            res.json({
                success: true,
                data: { token,user }
            })
        } else {
            throw new HttpException(StatusCodes.UNAUTHORIZED, '登录失败')
        }
    } catch (error) {
        next(error)
    }
}
//客户端登录成功以后，会在每次请求的时候把得到的jwt token通过请求头传给服务器
export const validate = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return next(new HttpException(StatusCodes.UNAUTHORIZED, '认证信息未提供'));
    }
    const token = authorization.split(' ')[1];// Bearer token
    if (!token) {
        return next(new HttpException(StatusCodes.UNAUTHORIZED, '认证信息未提供'));
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as UserPayload;
        const user = await User.findById(payload.id);
        if (!user) {
            return next(new HttpException(StatusCodes.UNAUTHORIZED, '用户不存在'));
        }
        res.json({ success: true, data: user });
    } catch (error:any) {
        next(new HttpException(StatusCodes.UNAUTHORIZED, error.message))
    }
}

export const uploadAvatar= async (req:Request,res:Response,next:NextFunction)=>{
  if(!req.file){
    return next(new HttpException(StatusCodes.BAD_REQUEST,'未上传文件'));
  }
  const {userId} = req.body;
  const avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(userId,{avatar});
  res.json({
    success:true,
    data:avatar
  })
}