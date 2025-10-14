import axios from './';
type SlidersResponseBody = ResponseBody<Array<Slider>>;
export function getSliders(){
    //指定接口的返回体的类型
    //SlidersResponseBody指的是接口的返回体类型
    //AxiosResponse {headers,data:SlidersResponseBody}
    return axios.get<SlidersResponseBody,SlidersResponseBody>('/slider/list');
}
type LessonsResponseBody = ResponseBody<LessonsBody>;
export function getLessons(category='all',offset:number,limit:number){
    return axios.get<LessonsResponseBody,LessonsResponseBody>(`/lesson/list`,{
        params:{
            category,
            offset,
            limit
        }
    });
}
type LessonResponseBody = ResponseBody<Lesson>;
export function getLesson(id:string){
  return axios.get<LessonResponseBody,LessonResponseBody>(`/lesson/${id}`);
}