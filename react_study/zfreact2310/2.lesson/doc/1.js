
function parent() {
    try{
        child();
    }catch(error){
        console.log('发生了错误，展示回退UI');
    }
   
}
function child() {
    console.log(undefined.a)
}
parent();