import {useNavigate} from '../react-router-dom'
function Home(){
    console.log('Home render');
    const navigate = useNavigate();
    function navigateTo(){
        navigate('/profile');
    }
    return (
        <div>
            <p>Home</p>
            <button onClick={navigateTo}>跳转到个人中心页</button>
        </div>
    )
}
export default Home;