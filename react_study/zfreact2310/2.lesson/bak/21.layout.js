import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
function Header(){
	return <div>Header</div>
}
function Main(){
	return <div>Main</div>
}
function Footer(){
	return <div>Footer</div>
}
//布局可以适当 优化，因为布局一般相对固定，所以减少渲染次数
const Layout = React.memo(() => {
	return (
		<div>
			<Header></Header>
			<Main></Main>
			<Footer></Footer>
		</div>
	)
})
class Layout2 extends React.PureComponent{
	render(){
		return (
			<div>
				<Header></Header>
				<Main></Main>
				<Footer></Footer>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Layout />);