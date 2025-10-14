import React from './react';
import ReactDOM from './react-dom/client';
//1.使用React.createContext创建一个新的上下文
const BorderContext = React.createContext('orange');
const ColorContext = React.createContext('orange');
//2.通过Context.Provider组件为下级组件提供上下文的值
//3.在子组件可以获取上下文的值
const { Provider: BorderProvider, Consumer: BorderConsumer } = BorderContext;
const { Provider: ColorProvider, Consumer: ColorConsumer } = ColorContext;
const commonStyle = {
	margin: '5px',
	padding: '5px'
}
function BorderBox(props) {
	return (
		<BorderConsumer>
			{
				(contextValue) => (
					<ColorConsumer>
						{
							(colorValue) => (
								<div style={{ ...commonStyle,
								color:colorValue.fontColor, border: `5px solid ${contextValue.color}` }}>
									{props.children}
								</div>
							)
						}
					</ColorConsumer>
				)
			}
		</BorderConsumer>
	)
}
//在类组件如何获取上层组件Provider传递过来的值
//可以给类组件添加一个动态属性contextType 值就是一个Context对象
class Header extends React.Component {
	render() {
		return (
			<BorderBox>
				Header
				<Title />
			</BorderBox>
		)
	}
}
function Title() {
	return (
		<BorderBox>
			标题
		</BorderBox>
	)
}
class Main extends React.Component {
	render() {
		return (
			<BorderBox>
				Main
				<Content />
			</BorderBox>
		)
	}
}
function ThemedButton(props) {
	return (
		<BorderConsumer>
			{
				(contextValue) => <button
					onClick={() => contextValue.changeColor(props.color)}>{props.label}</button>
			}
		</BorderConsumer>
	)
}
function Content() {
	return (
		<BorderBox>
			Content
			<ThemedButton label="变红" color='red' />
			<ThemedButton label="变绿" color='green' />
		</BorderBox>
	)
}
class Footer extends React.Component {
	static contextType = BorderContext;
	//如果类上有contextType静态属性的话，那么实例的context属性就会指向context的当前值
	render() {
		return <div style={{ border: `5px solid ${this.context.color}` }}>Footer</div>
	}
}
class App extends React.Component {
	state = { color: 'black', fontColor: "blue" }
	changeColor = (color) => {
		this.setState({ color });
	}
	render() {
		const contextValue = {
			color: this.state.color,
			changeColor: this.changeColor
		}
		return (
			<BorderProvider value={contextValue}>
				<ColorProvider value={{fontColor:this.state.fontColor}}>
					<BorderBox>
						Page
						<Header />
						<Main />
						<Footer />
					</BorderBox>
				</ColorProvider>
			</BorderProvider>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
