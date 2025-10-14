import { Skeleton, Card, Image, Button, Footer } from 'antd-mobile';
import { Link } from 'react-router-dom';
import { Lessons } from '@/store/slices/home';
import React, { useReducer,forwardRef ,useEffect} from 'react';
interface HomeLessonsProps {
    lessons: Lessons;
    fetchMoreLessons: () => void
    contentRef: React.RefObject<HTMLDivElement>;
}
const SWIPE_HEIGHT = 160;   //轮播图高度
const ITEM_HEIGHT = 300;    //每个课程卡片的高度
function getScale(){
    const remSize = parseFloat(document.documentElement.style.fontSize);
    return remSize/20;
}
const HomeLessons = forwardRef<()=>void,HomeLessonsProps>(({ lessons, fetchMoreLessons, contentRef },ref) => {
    const [,forceUpdate] = useReducer(x=>x+1,0);
    useEffect(()=>{
        (ref as React.MutableRefObject<()=>void>).current = forceUpdate;
    },[]);
    const scale = getScale();
    const realItemHeight = ITEM_HEIGHT*scale
    //容器的高度
    const containerHeight = window.innerHeight - 100*scale;
    let start = 0, end = 0;
    //获取容器的DOM引用
    const content = contentRef.current;
    //获取容器的向上卷去的高度 向上卷去的高度要减去轮播图的高度才是课程列表正向向上卷去的高度
    const scrollTop = content?Math.max(content!.scrollTop-SWIPE_HEIGHT*scale,0):0;
    //向上卷去的高度除以每个条目的高度向下取整就是起始索引
    start = Math.floor(scrollTop! / realItemHeight)
    //起始索引加上一页的条目数量就是结束索引. 每页的条目数量等于容器的高度除以每个条目的高度
    end = start + Math.floor(containerHeight / realItemHeight)
    start = Math.max(start - 2, 0);//起始索引向上多个二条
    end = Math.min(end + 2, lessons.list.length);//结束索引向下多取2条
    //截取出真正要渲染的课程数组
    const visibleList = lessons.list.map((item, index) => ({ ...item, index })).slice(start, end)
    const itemStyle = { position: 'absolute' as const, left: 0, width: "100%", height: realItemHeight };
    const contentHeight = lessons.list.length * realItemHeight + 'px';
    return (
        <section>
            {
                visibleList.length > 0 ? (
                    <div style={{ position: 'relative', width: '100%', height: contentHeight }}>
                        {
                            visibleList.map((lesson) => (
                                <Link
                                    style={{ ...itemStyle, top: `${lesson.index * realItemHeight}px` }}
                                    key={lesson.id}
                                    to={{ pathname: `/detail/${lesson.id}` }}
                                    state={lesson}>
                                    <Card headerStyle={{ display: 'flex', justifyContent: 'center' }} title={lesson.title}>
                                        <Image src={lesson.poster} />
                                    </Card>
                                </Link>
                            ))
                        }
                    </div>
                ) : <Skeleton.Title animated />
            }
            {
                lessons.hasMore ? (
                    <Button
                        onClick={fetchMoreLessons}
                        disabled={lessons.loading}
                        loading={lessons.loading}
                        block >{lessons.loading ? '' : '加载更多'}</Button>
                ) : <Footer label="后面没有了"></Footer>
            }
        </section>
    )
})
export default HomeLessons;