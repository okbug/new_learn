import { useState ,useEffect} from 'react';
import { Card, Image,Button } from 'antd-mobile'
import { useLocation, useParams } from 'react-router-dom';
import {getLesson} from '@/api/home';
import NavHeader from '@/components/NavHeader';
import { useDispatch } from 'react-redux';
import {addCartItem} from '@/store/slices/cart';
const Detail: React.FC = () => {
    const {id} = useParams<{id:string}>();
    const location = useLocation();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const dispatch = useDispatch();
    useEffect(()=>{
        (async function () {
            const lesson = location.state;
            if(lesson){
                setLesson(lesson);
            }else{
                const response = await getLesson(id as string);
                setLesson(response.data);
            }
        })();
    },[]);
    if(!lesson){
        return <NavHeader>加载中...</NavHeader>
    }
    const animateImageToCart = ()=>{
        const lessonImage = document.querySelector('.adm-image') as HTMLElement||null;
        const cartIcon = document.querySelector('.anticon-shopping-cart') as HTMLElement||null;
        if(!lessonImage || !cartIcon) return;
        const clonedLessonImage = lessonImage.cloneNode(true) as HTMLElement;
        const lessonImageRect = lessonImage.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        clonedLessonImage.style.cssText = `
          z-index:1000;
          opacity:0.8;
          position:fixed;
          width:${lessonImageRect.width}px;
          height:${lessonImageRect.height}px;
          top:${lessonImageRect.top}px;
          left:${lessonImageRect.left}px;
          transition:transform 2s ease-in-out,opacity 2s ease-in-out;
        `;
        document.body.appendChild(clonedLessonImage);
        const translateX = cartRect.left - lessonImageRect.left+cartRect.width/2-lessonImageRect.width/2;
        const translateY = cartRect.top-lessonImageRect.top+cartRect.height/2-lessonImageRect.height/2;
        setTimeout(()=>{
            clonedLessonImage.style.transform = `translate(${translateX}px,${translateY}px) scale(0)`;
            clonedLessonImage.style.opacity = '0.2'
            setTimeout(()=>clonedLessonImage.remove(),2000);
        },0);
    }
    const handleAddCartItem = ()=>{
        if(lesson){
            animateImageToCart();//编写一个商品飞入购物车的动画
            dispatch(addCartItem(lesson));//向仓库派发一个动作，把此商品添加到购物车里
        }
    }
    return (
        <>
            <NavHeader>{lesson.title}</NavHeader>
            <Card headerStyle={{display:'flex',justifyContent:'center'}} title={lesson.title}>
                <Image src={lesson.poster} />
            </Card>
            <Button color='primary' onClick={handleAddCartItem}>加入购物车</Button>
        </>
    )
}
export default Detail;