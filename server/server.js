import { uid } from 'uid';
const { v4: uuidv4 } = require('uuid');


const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middleware = jsonServer.defaults();

server.use(middleware);
server.use(jsonServer.bodyParser);

server.post('/tasks',(req,res)=>{
    const task = req.body;
    const tasks = router.db.get('tasks').value();
    // task.id = uid(3);
    task.id = uuidv4() ;
    router.db.get('tasks').push(task).write();
    res.send(task);
})

server.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('tasks').remove({ id }).write();
  res.send({});
});

server.put('/tasks/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    const task = router.db.get('tasks').find({id}).value();
    const updateTask = req.body;
    router.db.get('tasks').find({id}).assign(updateTask).write();
    res.send(updateTask);

})

server.use(router);

const PORT = 3001;

server.listen(PORT,()=>{
    console.log('JSON-SERVER is running on 3001')
})


//router
//middleware for json server
//mock api (get,post,delete,patch)