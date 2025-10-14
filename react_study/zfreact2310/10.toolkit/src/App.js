import todosApi  from "./todosApi";
function App(){
	const {data,error,isLoading} = todosApi.endpoints.getTodos.useQuery(1);
	console.log('data',data,'error',error,'isLoading',isLoading);
	if(isLoading){
		return <div>加载中......</div>
	}else if(error){
		return <div>{error.data.message}</div>
	}else if(data){
		return <div>{data.map(todo=>todo.text).join(',')}</div>
	}else{
		return null;
	}
}
export default App;