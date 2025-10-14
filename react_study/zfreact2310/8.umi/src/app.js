import  React from 'react';
//import Foo from '@/extraRoutes/Foo';
/* export function patchClientRoutes({ routes }) {
    routes.unshift({
        path: '/foo',
        element: <Foo />
    });
} */
//假如说这个extraRoutes不是前台写死的，而是在运行的时候调用接口动态生成的
let extraRoutes = [];
export function patchClientRoutes({ routes }) {
    routes.unshift(...extraRoutes);
}
export function render(oldRender) {
    fetch('/api/routes').then(response=>response.json())
    .then(response=>{
        extraRoutes=response.map((route)=>{
            const {path,component}=route;
            const RouteComponent = require(`@/extraRoutes/${component}`);
            return {
                path,
                element:React.createElement(RouteComponent.default)
            }
        });
        oldRender();
    })
}