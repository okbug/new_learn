import todosApi  from "./todosApi";
function App(){
	const {data,error,isLoading} = todosApi.endpoints.getTodo.useQuery(1);
	console.log('data',data,'error',error,'isLoading',isLoading);
	if(isLoading){
		return <div>加载中......</div>
	}else if(error){
		return <div>{error.data.message}</div>
	}else if(data){
		return <div>{data.text}</div>
	}else{
		return null;
	}
}
export default App;