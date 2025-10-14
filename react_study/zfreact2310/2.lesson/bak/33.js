
//这里可以保存hooks的状态
//const hookStates = [];
//这是当前hook的索引
//let hookIndex = 0;
let currentFunctionComponent=null;
function useState(initVal){
	const currentHookIndex = currentFunctionComponent.hookIndex;
	const hookStates=currentFunctionComponent.hookStates;
	if(!hookStates[currentHookIndex]){
		hookStates[currentHookIndex]=[
			initVal,
			(newVal)=>{
				//接收到新的值之后，会给hookStats的指定索引赋值
				hookStates[currentHookIndex]=newVal;
				//重新更新整个应用
				render();
			}
		]
	}
	return hookStates[currentFunctionComponent.hookIndex++];
}
let times = 3;
function FunctionComponent(){
	currentFunctionComponent=FunctionComponent;
	//不要在循环语句、条件语句中或者嵌套函数中使用hooks
	for(let i=0;i<times;i++){
		let [firstName] = useState('zhang');
	}
	times=5;
	let [lastName,setLastName] = useState('san');
	currentFunctionComponent=null;
	return setLastName
}
FunctionComponent.hookStates = [];
FunctionComponent.hookIndex=0;

function render(){
	hookIndex=0;//每次渲染前都要重置索引，保证索引的位置是对的
	//return FunctionComponent();
	useState('zhang');
}
const setLastName = render();
console.log(FunctionComponent.hookStates.map(item=>item[0]).join('-'))
setLastName('四');
console.log(FunctionComponent.hookStates.map(item=>item[0]).join('-'))