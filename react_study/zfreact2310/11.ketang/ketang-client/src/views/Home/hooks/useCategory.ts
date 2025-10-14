import {useSelector,useDispatch} from 'react-redux';
import { HomeState,changeCurrentCategory } from '@/store/slices/home';
import type {RootState} from '@/store';
const useCategory = ()=>{
    const {currentCategory} = useSelector<RootState,HomeState>(state=>state.home);
    const dispatch = useDispatch();
    const handleChangeCurrentCategory = (currentCategory:string)=>{
        dispatch(changeCurrentCategory(currentCategory));
    };
    return {
        currentCategory,
        handleChangeCurrentCategory
    }
}
export default useCategory;