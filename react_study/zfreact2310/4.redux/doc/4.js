

let promise = new Promise((resolve,reject)=>{
    setTimeout(()=>{
        if(Math.random()>.5){
            resolve();
        }else{
            reject();
        }
    },1000)
})
promise.then((result)=>{
    console.log(result)
}).catch(error)=>{
    console.log(error)
};