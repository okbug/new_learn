import React from 'react';
import { Router } from 'react-router';
/**
 * 路由容器
 * @param {*} history历史对象
 * @param {*} children 子元素
 */
export function HistoryRouter({ history, children }) {
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });
    React.useLayoutEffect(()=>{
        //当路径发生变化的时候重新执行setState
        history.listen(setState);
    },[history]);
    return (
        <Router
            location={state.location}
            action={state.action}
            navigator={history}
            navigationType={history.action}
        >
            {children}
        </Router>
    )
}