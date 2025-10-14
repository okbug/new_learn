import React from './react';
import ReactDOM from './react-dom/client';
function Animation() {
	const ref = React.useRef();//{current:null}
	React.useLayoutEffect(() => {
		ref.current.style.transform = `translate(500px)`;
		ref.current.style.transition = `all 500ms`;
		while(true){}
	}, []);
	const styleObj = {
		width: '100px',
		height: '100px',
		borderRadius: '50%',
		backgroundColor: 'red'
	}
	return (
		<div style={styleObj} ref={ref}>

		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Animation />);
