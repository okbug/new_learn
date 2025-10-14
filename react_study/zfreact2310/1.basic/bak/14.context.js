import React from 'react';
import ReactDOM from 'react-dom/client';
const CounterContext = React.createContext();
class App extends React.Component {
	render() {
		return (
			<CounterContext.Provider value={1}>
				<CounterContext.Consumer>
					{
						(value) => {
							console.log('first', value)
							return (
								<CounterContext.Provider value={2}>
									<CounterContext.Consumer>
										{
											(value) => {
												console.log('second', value)
												return (
													<CounterContext.Provider value={3}>
														<CounterContext.Consumer>
															{
																(value) => {
																	console.log('third', value)
																	return <div>{value}</div>
																}
															}
														</CounterContext.Consumer>
													</CounterContext.Provider>
												)
											}
										}
									</CounterContext.Consumer>
								</CounterContext.Provider>
							)
						}
					}
				</CounterContext.Consumer>
				<CounterContext.Consumer>
					{
						(value) => {
							console.log('老二', value)
							return <div>{value}</div>
						}
					}
				</CounterContext.Consumer>
			</CounterContext.Provider>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
