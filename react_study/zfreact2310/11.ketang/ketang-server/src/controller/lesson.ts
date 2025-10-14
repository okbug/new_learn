import type { Request, Response } from 'express';
import { ILessonDocument, Lesson } from '../models';
import { FilterQuery } from 'mongoose';
/**
 * 客户端发请求的时候待上分页的参数
 * http://localhost:9898/lesson/list?category=react&offset=0&limit=5
 * @param _req 
 * @param res 
 */
export const list = async (req: Request, res: Response) => {
    const { category } = req.query;
    let offset: any = req.query.offset;
    let limit: any = req.query.limit;
    offset = isNaN(offset) ? 0 : parseInt(offset);
    limit = isNaN(limit) ? 0 : parseInt(limit);
    let query: FilterQuery<ILessonDocument> = {};
    if (category && category !== 'all') {
        query.category = category;
    }
    //查询符合条件的总条数
    let total = await Lesson.countDocuments(query);
    const list = await Lesson.find(query)
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit)
    setTimeout(() => {
        res.json({
            success: true,
            data: {//0,5  5=5
                hasMore: total > offset + limit,
                list
            }
        })
    }, 1000)
}
export const get = async (req: Request, res: Response) => {
    let { id } = req.params;
    const lesson = await Lesson.findById(id)
    res.json({
        success: true,
        data: lesson
    })
}