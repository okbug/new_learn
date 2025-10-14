import { useEffect, useRef } from 'react';
import { DotLoading } from 'antd-mobile';
import HomeHeader from './components/HomeHeader';
import HomeSwiper from './components/HomeSwiper';
import HomeLessons from './components/HomeLessons';
import { useCategory, useSliders, useLessons } from './hooks';
import { reachBottom, pullRefresh,throttle} from '@/utils';
function Home() {
    const { currentCategory, handleChangeCurrentCategory } = useCategory();
    const { sliders } = useSliders();
    const { lessons, fetchMoreLessons, initLessons } = useLessons();
    const contentRef = useRef<HTMLDivElement>(null);
    const homeLessonsRef = useRef<() => void>(() => { });
    useEffect(() => {
        if (contentRef.current) {
            reachBottom(contentRef.current, fetchMoreLessons);
            pullRefresh(contentRef.current, initLessons);
            contentRef.current.addEventListener('scroll', throttle(homeLessonsRef.current,16));
            contentRef.current.addEventListener('scroll', () => {
                sessionStorage.setItem('scrollTop', contentRef.current!.scrollTop.toString());
            });
        }
    }, []);
    useEffect(() => {
        const scrollTop = sessionStorage.getItem('scrollTop');
        if (scrollTop) {
            contentRef.current!.scrollTop = +scrollTop;
        }
    }, []);
    return (
        <>
            <div className="fixed top-[50px] w-full text-center text-6xl">
                <DotLoading />
            </div>
            <HomeHeader currentCategory={currentCategory} changeCurrentCategory={handleChangeCurrentCategory} />
            <div ref={contentRef} className='fixed top-10 bottom-10 left-0 w-full overflow-auto bg-white'>
                {sliders.length > 0 && <HomeSwiper sliders={sliders} />}
                <HomeLessons ref={homeLessonsRef} lessons={lessons} fetchMoreLessons={fetchMoreLessons} contentRef={contentRef} />
            </div>
        </>
    )
}
export default Home;