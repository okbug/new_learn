import {Link} from 'umi'
function Page(){
    return (
        <ul>
          <li><Link to="/user/detail/1">张三</Link></li>
          <li><Link to="/user/detail/2">李四</Link></li>
        </ul>
    )
}
export default Page;