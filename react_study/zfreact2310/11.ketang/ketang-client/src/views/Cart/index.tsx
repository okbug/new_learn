import {useRef} from 'react';
import { List, Grid, Checkbox, Input, Button, Space, SwipeAction,Dialog } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { CartState,ChangeCountPayload, changeCheckedCartItems, clearCartItems, settle,removeCartItem,changeCartItemCount } from '@/store/slices/cart';
import NavHeader from '@/components/NavHeader';
const Cart: React.FC = () => {
    const dispatch = useDispatch();
    const cart = useSelector<RootState, CartState>(state => state.cart);
    //计算总数量
    const totalCount = cart.filter(item => item.checked).reduce((total, item) => total + item.count, 0);
    //计算总金
    const totalPrice = cart.filter(item => item.checked).reduce((total, item) => total + (
        parseFloat(item.lesson.price.replace(/[^0-9\.]/g, '')) * item.count), 0);
    return (
        <div className="p-1">
            <NavHeader>购物车</NavHeader>
            <CartItems
                cart={cart}
                changeCheckedCartItems={(ids) => dispatch(changeCheckedCartItems(ids))}
                removeCartItem={(id:string)=>dispatch(removeCartItem(id))}
                changeCartItemCount={(changeCountPayload:ChangeCountPayload)=>dispatch(changeCartItemCount(changeCountPayload))}
            />
            <Grid columns={15} gap={8} className='items-center h-16'>
                <Grid.Item span={3}>
                    <Button color='warning' size='small' onClick={() => dispatch(clearCartItems())}>清空</Button>
                </Grid.Item>
                <Grid.Item span={5}>
                    总计{totalCount}件
                </Grid.Item>
                <Grid.Item span={4}>
                    总计¥{totalPrice}元
                </Grid.Item>
                <Grid.Item span={3}>
                    <Button color='primary' size='small' onClick={() => dispatch(settle())}>结算</Button>
                </Grid.Item>
            </Grid>
        </div>
    )
}
interface CartItemsProps {
    cart: CartState;
    changeCheckedCartItems: (ids: string[]) => void;
    removeCartItem:(id:string)=>void;
    changeCartItemCount:(changeCountPayload:ChangeCountPayload)=>void
}
const CartItems: React.FC<CartItemsProps> = ({ cart, changeCheckedCartItems,removeCartItem,changeCartItemCount }) => {
    //计算出选中的课程的ID数组
    const selectedLessonIds = cart.filter(item => item.checked).map(item => item.lesson.id);
    const swipeActionRef = useRef<any>(null);
    return (
        <Space direction="vertical">
            <Checkbox
                indeterminate={selectedLessonIds.length > 0 && selectedLessonIds.length < cart.length}
                checked={cart.length > 0 && selectedLessonIds.length === cart.length}
                onChange={(checked) => {
                    let newLessonIds = checked ? cart.map(item => item.lesson.id) : [];
                    changeCheckedCartItems(newLessonIds)
                }}
            >全选</Checkbox>
            <Checkbox.Group
                value={selectedLessonIds}
                onChange={(value: CheckboxValue[]) => {
                    changeCheckedCartItems(value as string[])
                }}
            >
                <Space direction="vertical">
                    <List>
                        {
                            cart.map(({ lesson, checked, count }, index) => (
                                <SwipeAction
                                 ref={swipeActionRef}
                                 key={lesson.id}
                                 closeOnAction={false}
                                 closeOnTouchOutside={false}
                                 rightActions={[
                                    {
                                        key:"remove",
                                        text:'删除',
                                        color:'red',
                                        onClick:async ()=>{
                                            const result = await Dialog.confirm({
                                                content:'请问你确定要删除吗?'
                                            })
                                            if(result){
                                                removeCartItem(lesson.id);
                                            }else{
                                                swipeActionRef.current.close();
                                            }
                                        }
                                    }
                                 ]}
                                >
                                    <List.Item >
                                        <Grid columns={12} gap={8}>
                                            <Grid.Item span={1}>
                                                <Checkbox value={lesson.id} />
                                            </Grid.Item>
                                            <Grid.Item span={5}>
                                                {lesson.title}
                                            </Grid.Item>
                                            <Grid.Item span={3}>
                                                {lesson.price}
                                            </Grid.Item>
                                            <Grid.Item span={3}>
                                                <Input 
                                                value={count.toString()} 
                                                onChange={(value:any)=>{
                                                    if(/[0-9]+/.test(value)){
                                                        changeCartItemCount({
                                                            id:lesson.id,
                                                            count:parseInt(value)
                                                        })
                                                    }
                                                }}
                                                />
                                            </Grid.Item>
                                        </Grid>
                                    </List.Item>
                                </SwipeAction>
                            ))
                        }
                    </List>
                </Space>
            </Checkbox.Group>
        </Space>
    )
}
export default Cart;