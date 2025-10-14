import { useEffect } from 'react';
import { RootState } from "@/store";
import { HomeState, setSliders } from "@/store/slices/home";
import { useDispatch, useSelector } from "react-redux";
import { getSliders } from '@/api/home'
export const useSliders = () => {
    const dispatch = useDispatch();
    //获取仓库中的sliders并返回
    const { sliders } = useSelector<RootState, HomeState>((state: RootState) => state.home);
    const fetchSliders = () => {
        getSliders().then(({ data }) => {
            dispatch(setSliders(data))
        })
    }
    useEffect(fetchSliders, []);
    return {
        sliders
    }
}
export default useSliders;