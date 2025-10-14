import {Swiper,Image} from 'antd-mobile';
interface HomeSwiperProps{
    sliders:Array<Slider>
}
const HomeSwiper:React.FC<HomeSwiperProps> = ({sliders})=>{
    return (
        <Swiper autoplay={true} loop={true}>
           {
            sliders.map(slider=>(
                <Swiper.Item key={slider.url}>
                    <div className='h-32'>
                        <Image style={{'--height':'100%'}} src={slider.url} lazy/>
                    </div>
                </Swiper.Item>
            ))
           }
        </Swiper>
    )
}
export default HomeSwiper;