
let actionCreators = {
    toCounter(){
        //我在这里跳路径?
        //useNavigate() => navigate
        //<Navigator/>
        //以后的跳转方式都需要React组件里，在组件外的actionCreator里如何跳转？
        return function(dispatch){
            dispatch(push('/counter'));
        }
    }

}
export default actionCreators;
//UMI里用到了
//经历我三个名字
//react-router-redux
//connected-react-router
//redux-first-history