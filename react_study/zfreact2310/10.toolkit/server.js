let express = require('express');
let cors = require('cors');
let app = express();
app.use(express.json());
app.use(cors());
let success= true;
app.use((req, res, next) => {
    if(success){
        success = false;
        next();
    }else{
        success = true;
        res.status(500).json({message:'服务器出错'});
    }
});
let todos = [{ id: 1, text: "吃饭" }, { id: 2, text: "睡觉" }];
app.get('/todos/list', (_req, res) => {
    res.json(todos);
});
app.get('/todos/detail/:id', (req, res) => {
    let id = req.params.id;
    let todo = todos.find(item => item.id === parseInt(id));
    res.json(todo);
});
app.post('/todos', (req, res) => {
    let todo = req.body;
    todo.id = todos[todos.length-1].id+1;
    todos.push(todo);
    res.json(todo);
});
app.listen(8080, () => console.log(`服务在端口8080启动`));