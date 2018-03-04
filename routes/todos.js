var express = require("express");
var router = express.Router();
var Todo = require("../models/todo");
var Client = require("../models/client");
var User = require("../models/user");
var middleware = require("../middleware");
var functions = require("./functions.js");
var queries = require("./queries.js");
const fs = require('fs');


//ROUTES

router.get("/", middleware.isLoggedIn, function(req, res){
  if(req.query.keyword) {
    const regex = new RegExp(functions.escapeRegex(req.query.keyword), 'gi');
    queries.searchByName(regex, function(err, todos){
      if(req.xhr) {
        if(req.user){
            res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
        }else{
            res.json({todos:todos});
        }
      }
    });
  } else if(req.query.name && req.query.name !== 'Todos') {
      queries.orderTodosByName(req.query.name,function(err,todos){
        if(err){
          console.log(err);
        } else {
          res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
        }
      });
  } else {
      queries.orderTodos(function(err, todos){
      if(err){
        console.log(err);
      } else {
        if(req.xhr) {
          if(req.user){
              res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
          }else{
              res.json({todos:todos});
          }
        } else {
          res.render("index", {todos: todos, page: 'todos'});
        }
      }
    });
  }
});

// app.get("/todos/new", function(req, res){
//  res.render("new");
// });

router.post("/", middleware.isLoggedIn, function(req, res){

  req.body.todo.name = req.sanitize(req.body.todo.name);

  var formData = req.body.todo;

  todoObj = {
    name: req.body.todo.name,
    stateNumber: req.body.todo.stateNumber,
    priorityNumber: req.body.todo.priorityNumber,
    processType: req.body.todo.processType,
    createAt: req.body.todo.createAt,
    dateDelivery: req.body.todo.dateDelivery,
    office: req.body.todo.office,
    assignUser: req.body.todo.assignUser,
    client : {
      name: req.body.todo.client,
      clientTypeNumber: req.body.todo.clientTypeNumber,
    }
  }

  todoObj.client.clientType = functions.setClientType(todoObj.client.clientTypeNumber);
  todoObj.priority = functions.setPriorityNumber(todoObj.priorityNumber);

  User.find({ username: todoObj.assignUser}, function(err, user){
    if(err){todoObj
        console.log(err);
    } else {
      if(user.length){ //Si encuentra al usuario, setea los datos en el objeto
        todoObj.assignUser = {
          id: user[0]._id,
          username: user[0].username
        }

        Client.findOne({ name: todoObj.client.name}, function(err, clientFound){
          if(err){
            console.log(err); 
          } else {
            if(clientFound){ //Si encuentra al cliente, setea los datos en el objeto
              Todo.create(todoObj, function (err, newTodo) { //Crea el proceso sin actualizar los datos del cliente
                if (err) {
                  console.log(err);
                } else {
                  queries.orderTodos(function (err, todos) {
                    if (err) {
                      console.log(err);
                    } else {
                      res.json({ todos: todos, id: req.user._id, isAdmin: req.user.isAdmin });
                    }
                  });
                  //res.json(newTodo);
                }
              });
            } else {
              res.json({});
            }
          }
        }).limit(1);
      }
    }
  });
});

router.get("/:id", middleware.isLoggedIn, function(req, res){
  Todo.findById(req.params.id, function(err, todo){
    if(err){
      console.log(err);
      res.redirect("/")
    } else {
      if(req.xhr) {
        console.log(todo);
        res.json(todo);
      } else {
        res.render("edit", {todo: todo});
      }
    }
  });
});


router.put("/:id", middleware.checkProcessOwnership, function(req, res){
 
  if (req.body.todo.priorityNumber) {
    req.body.todo.priority = functions.setPriorityNumber(req.body.todo.priorityNumber);
  }
    
  if (typeof req.body.todo.assignUser !== 'undefined'){
    //Si usuario esta definido, modificar todo
    User.find({ username : req.body.todo.assignUser}, function(err, user){
      if(err){
         console.log(err);
      } else {
          if(user.length){ //Si encuentra al usuario, setea los datos en el objeto
           req.body.todo.assignUser = {
             id: user[0]._id,
             username: user[0].username
           }
           Todo.findByIdAndUpdate(req.params.id, req.body.todo, {new: true}, function(err, todo){
             if(err){
               console.log(err);
             } else {
               queries.orderTodos(function(err, todos){
                 if(err){
                   console.log(err);
                 }else{
                   res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
                 }
               });
             }
           });
         }
      }
    });
  } else{
    //Si usuario no esta definido, cerrar proceso
    Todo.findByIdAndUpdate(req.params.id, req.body.todo, {new: true}, function(err, todo){
      if(err){
        console.log(err);
      } else {
        queries.orderTodos(function(err, todos){
          if(err){
            console.log(err);
          }else{
            res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
          }
        });
      }
    });
  }


});

router.delete("/:id", middleware.checkProcessOwnership, function(req, res){
 Todo.findByIdAndRemove(req.params.id, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});

module.exports = router;
