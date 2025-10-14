let state = {number:0,age:1,home:'bj'}

function setState(newState){
    state={...state,...newState}
}
setState({number:2})
console.log(state)