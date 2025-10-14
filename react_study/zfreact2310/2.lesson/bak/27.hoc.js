import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
const LanguageContext = React.createContext();
const texts = {
	en:{
		greeting:'hello',
		farewell:'goodbye'
	},
	zh:{
		greeting:'你好',
		farewell:'再见'
	}
}
function LanguageProvider(props){
	const [language,setLanguage] = React.useState('en');
	return (
		<LanguageContext.Provider value={{language,setLanguage}}>
			{props.children}
		</LanguageContext.Provider>
	)
}
const withLanguage = (WrappedComponent)=>{
	return (props)=>{
		const {language,setLanguage} = React.useContext(LanguageContext);
		return <WrappedComponent language={language} setLanguage={setLanguage} {...props}/>
	}
}
const SwitchLanguage = withLanguage(({setLanguage})=>{
	return (
		<div>
			<button onClick={()=>setLanguage('en')}>English</button>
			<button onClick={()=>setLanguage('zh')}>中文</button>
		</div>
	)
})
const LocalizedText = withLanguage(({language})=>{
	return (
		<div>
			<p>{texts[language].greeting}</p>
			<p>{texts[language].farewell}</p>
		</div>
	)
})
function App(){
	return (
		<LanguageProvider>
			<SwitchLanguage/>
			<LocalizedText/>
		</LanguageProvider>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);