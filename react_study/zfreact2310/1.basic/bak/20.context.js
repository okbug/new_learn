import React from './react';
import ReactDOM from './react-dom/client';
const MyContext = React.createContext('defaultValue');
function Child(){
	const value = React.useContext(MyContext);
	return <div>{value}</div>
}
function App(){
	return (
		<MyContext.Provider value="hello from context">
			<Child/>
		</MyContext.Provider>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
