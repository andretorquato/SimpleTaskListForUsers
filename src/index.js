const express = require('express');
const cors = require('cors');
const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) return response.status(400).json({ error: "User not found"});

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userExists = users.some(user => user.username === username);

  if(userExists) return response.status(400).json({ error: 'User already exists'});

  const newUser = {
    id: v4(),
    name,
    username,
    todos: []
  };
  
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let todoBeUpdated = user.todos.find(todo => todo.id === id);

  if(!todoBeUpdated) return response.status(404).json({ error: "Todo not found"});

  todoBeUpdated = {
    ...todoBeUpdated,
    title,
    deadline: new Date(deadline)
  };

  return response.status(200).json(todoBeUpdated);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;


  let finishTodo = user.todos.find(todo => todo.id === id);
  
  if(!finishTodo) return response.status(404).json({ error: "Todo not found"});

  finishTodo.done = true;

  return response.json(finishTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const removedTodo = user.todos.find(todo => todo.id === id);

  if(!removedTodo) return response.status(404).json({ error: "Todo not found"});

  user.todos.splice(removedTodo, 1);

  return response.status(204).json();
});

module.exports = app;