import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
//import styled from 'styled-components';
const styled = {
	h1: ([styles]) => {
		return props => <h1 style={parseStyles(styles)} {...props} />
	},
	button: ([styles]) => {
		return props => <button style={parseStyles(styles)} {...props} />
	}
}
function convertToCamelCase(cssProperty){
	return cssProperty.replace(/-([a-z])/g,(_,letter)=>{
		return letter.toUpperCase();
	});
}
function parseStyles(styles) {
	return styles.split(';').reduce((styleObj, style) => {
		const [key, value] = style.split(':');
		if(key && value){
			styleObj[convertToCamelCase(key.trim())] = value;
		}
		return styleObj;
	}, {})
}
//styled允许 你编写实际的CSS代码来为你的React组件设置样式，同时保持了样式与组件的封装性
const Title = styled.h1`
color:red;
`
const StyledButton = styled.button`
background-color:green;
color:white;
`
function App() {
	return (
		<div>
			<Title>hello</Title>
			<StyledButton>Click Me</StyledButton>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);