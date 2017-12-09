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
  console.log('2');
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
      console.log('7');
      queries.orderTodos(function(err, todos){
      if(err){
        console.log(err);
      } else {
        // console.log(todos);
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
    formData.clientType = functions.setClientType(formData.clientTypeNumber);
    formData.priority = functions.setPriorityNumber(formData.priorityNumber);

    var clientsData = functions.fetchClientsData ();
    console.log(formData);
    var clientName;
    if(typeof formData.clientTypeId !== 'undefined'){
        clientsData.forEach(function(client){
            if(client.clientTypeId === formData.clientTypeId){
                clientName = client.name;
                return false;
            }
         });
    } else {
        return false;
    }


    //Creamos objeto con datos del cliente del formulario
    var clientData = {
        name : clientName,
        clientTypeId : formData.clientTypeId,
        clientType: formData.clientType,
        clientTypeNumber : formData.clientTypeNumber
    }

    User.find({ username : formData.assignUser}, function(err, user){
        if(err){
            console.log(err);
        } else {
            if(user.length){ //Si encuentra al usuario, setea los datos en el objeto
                formData.assignUser = {
                 id: user[0]._id,
                 username: user[0].username
                }
                Client.find({ clientTypeId : clientData.clientTypeId}, function(err, client){
                    if(err){
                        console.log(err);
                    } else {
                        if(client.length){ //Si encuentra al cliente, setea los datos en el objeto
                            formData.client = {
                                id : client[0]._id,
                                clientTypeId: client[0].clientTypeId,
                                clientType: client[0].clientType,
                                clientTypeNumber : client[0].clientTypeNumber
                            }

                            Todo.create(formData, function(err, newTodo){ //Crea el proceso sin actualizar los datos del cliente
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
                                  //res.json(newTodo);
                                }
                            });
                        } else { //Si no encuentra el cliente, crea los datos del mismo con los datos del form
                            return false;
                        }
                    }
                }).limit(1);
            }
        }
    });
});

router.get("/:id", middleware.isLoggedIn, function(req, res){
    console.log('todos/id');
    Todo.findById(req.params.id, function(err, todo){
        if(err){
             console.log(err);
             res.redirect("/")
        } else {
            if(req.xhr) {
                var clientsData = functions.fetchClientsData ();
                clientsData.forEach(function(client){
                    if(client.clientTypeId == todo.client.clientTypeId){
                        todo.client.name = client.name;
                        return false;
                    }
                });
                res.json(todo);
            } else {
                res.render("edit", {todo: todo});
            }
        }
    });
});


router.put("/:id", middleware.checkProcessOwnership, function(req, res){
console.log('4');
console.log(req.user);
  switch(req.body.todo.priorityNumber){
    case "1":
              req.body.todo.priority = "Alta";
              break;
    case "2":
              req.body.todo.priority = "Media";
              break;
    case "3":
              req.body.todo.priority = "Baja";
              break;
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
                   console.log('todo ok');
                   res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
                 }
               });
                console.log('5');
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
            console.log('todo ok');
            res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
          }
        });
         console.log('5');
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
