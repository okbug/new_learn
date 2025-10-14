import { LeftOutlined } from '@ant-design/icons';
import {PropsWithChildren} from 'react';
import { useNavigate } from 'react-router-dom';
type NavHeaderProps = PropsWithChildren<{}>;
const NavHeader:React.FC<NavHeaderProps> = ({children})=>{
    const navigate = useNavigate();
    return (
        <div className='fixed top-0 left-0 w-full h-10 z-50 flex items-center justify-center bg-gray-800 text-white text-sm'>
           <LeftOutlined className='absolute left-5' onClick={()=>navigate(-1)}/>
            {children}
        </div>
    )
}
export default NavHeader;