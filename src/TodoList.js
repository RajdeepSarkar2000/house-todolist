import React , {useState,useEffect} from 'react'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Button from '@mui/material/Button';
import { Paper } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';



function TodoList(){

    const grid = 8;
    const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
    background: isDragging ? "lightyellow" : "white",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightgreen" : "lightblue",
  padding: grid,
  width: 450 ,
  
  
});
const [newTask, setNewTask] = useState('');
  const [updateTask, setUpdateTask] = useState('');
  const [updateTaskId, setUpdateTaskId] = useState(null);

  const queryClient = useQueryClient();

  const {  data: tasks = [] } = useQuery('tasks', () =>
    fetch('http://localhost:3001/tasks').then((res) => res.json())
  );

  const addTaskMutation = useMutation((text) =>
    fetch('http://localhost:3001/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((res) => res.json())
  );

  const deleteTaskMutation = useMutation((id) =>
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'DELETE',
    }).then((res) => res.ok)
  );

  const updateTaskMutation = useMutation(({ id, text }) =>
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((res) => res.json())
  );

  const handleNewTask = (event) => {
    setNewTask(event.target.value);
  };

  const handlePost = (event) => {
    event.preventDefault();
    addTaskMutation.mutate(newTask, {
      onSuccess: (data) => {
        queryClient.setQueryData('tasks', (oldData) => [...oldData, data]);
        setNewTask('');
      },
    });
  };

  const handleDelete = (id) => {
    deleteTaskMutation.mutate(id, {
      onSuccess: () => {
        queryClient.setQueryData('tasks', (oldData) =>
          oldData.filter((task) => task.id !== id)
        );
      },
    });
  };

  const handleUpdate = (id, text) => {
    setUpdateTaskId(id);
    setUpdateTask(text);
  };

  const handleUpdateTaskChange = (event) => {
    setUpdateTask(event.target.value);
  };

  const handleUpdateCancel = () => {
    setUpdateTaskId(null);
  };

  const handlePut = (id) => {
    updateTaskMutation.mutate({ id, text: updateTask }, {
      onSuccess: (data) => {
        queryClient.setQueryData('tasks', (oldData) =>
          oldData.map((task) =>
            task.id === data.id ? { ...task, text: data.text } : task
          )
        );
        setUpdateTaskId(null);
      },
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const newTasks = Array.from(tasks);
    const [reorderedItem] = newTasks.splice(result.source.index, 1);
newTasks.splice(result.destination.index, 0, reorderedItem);
queryClient.setQueryData('tasks', newTasks);
};

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
        <Paper style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)', background: 'linear-gradient(107deg, rgb(2, 108, 223) 27.4%, rgb(0, 255, 255) 92.7%)'}}>
            <form onSubmit ={handlePost}>
                <input type ="text" value = {newTask} onChange = {handleNewTask}/>
                <Button type ="submit" style={{color:'darkblue'}}>Add Task</Button>
            </form>
            
                <Droppable droppableId='droppable'>
                    {(provided,snapshot)=>(
                        <ul {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                {tasks.map((task,index) => (
                    <Draggable key ={task.id} draggableId={task.id} index={task.id}>
                        {(provided)=> (
                    <li ref={provided.innerRef}
                    draggable="true"
                      {...provided.draggableProps}
                      {...provided.dragHandleProps} style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>{
                        updateTaskId === index ? (
                        <>
                        <input type = "text" value = {updateTask} onChange = {handleUpdateTaskChange}/>
                        <Button onClick={()=> handlePut(task.id)}>Save</Button>
                        <Button onClick={()=> handleUpdateCancel}>Cancel</Button>
                        
                        </>
                    ) : (
                    <>
                    {task.text}
                    <Button onClick ={()=> handleDelete(index)}>Delete</Button>
                    <Button onClick ={()=>handleUpdate(index)}>Edit</Button>
                    </>
                    )
                
                } </li>)}
                </Draggable>
                ))}
                {provided.placeholder}
            </ul>
                    )}
                   
                </Droppable>
            
            
        </Paper>
        </DragDropContext>
    );

}

export default TodoList ;