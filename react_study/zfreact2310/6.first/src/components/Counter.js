import React from 'react'
import { useDispatch,useSelector } from 'react-redux'
export default function Home() {
  const counter = useSelector(state=>state.counter);
  const state = useSelector(state=>state.router);
  console.log('state',state)
  const dispatch = useDispatch();
  return (
    <div>
      <p>{counter.number}</p>
      <button onClick={()=>dispatch({type:'ADD'})}>+</button>
      <button onClick={()=>dispatch({type:'MINUS'})}>-</button>
    </div>
  )
}
//