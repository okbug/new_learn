import { useState } from 'react';
import { BarsOutlined } from '@ant-design/icons';
import { Transition } from 'react-transition-group';
import logo from '@/assets/images/logo.png';
const DURATION = 2000;
interface HomeHeaderProps{
    currentCategory:string;
    changeCurrentCategory:(currentCategory:string)=>void
}
const HomeHeader: React.FC<HomeHeaderProps> = ({currentCategory,changeCurrentCategory}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const getClassName = (category: string): string => {
        return 'py-1 text-center text-base border-t border-gray-500 ' + (category === currentCategory ? 'text-red-500' : 'text-white');//padding-top padding-bottom =0.25rem=20/4=5px
    }
    const handleCategoryClick = (event:React.MouseEvent<HTMLUListElement>)=>{
        const target = event.target as HTMLElement;
        const category = target.dataset.category;
        if(category){
            changeCurrentCategory(category);
            setIsMenuVisible(false)
        }
    }
    return (
        <header className="fixed top-0 left-0 w-full z-50">
            <div className='flex justify-between items-center h-10 bg-gray-800 text-white'>
                <img src={logo} className='w-20 ml-5' />
                <BarsOutlined className='text-base mr-5' onClick={()=>setIsMenuVisible(!isMenuVisible)}/>
            </div>
            <Transition in={isMenuVisible} timeout={DURATION}>
                {
                    (state) => (
                        <ul className={
                            `absolute w-full top-10 left-0  bg-gray-800  transition-opacity ${state==='entering'||state === 'entered'?'opacity-100':'opacity-0'}`
                            }
                            style={{transitionDuration:`${DURATION}ms`}}
                            onClick={handleCategoryClick}
                            >
                            <li data-category='all' className={getClassName('all')}>全部课程</li>
                            <li data-category='react' className={getClassName('react')}>React课程</li>
                            <li data-category='vue' className={getClassName('vue')}>Vue课程</li>
                        </ul>
                    )
                }
            </Transition>

        </header>
    )
}
export default HomeHeader;
