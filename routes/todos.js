var express = require("express");
var router = express.Router();
var Todo = require("../models/todo");
var Client = require("../models/client");
var User = require("../models/user");
var middleware = require("../middleware");


//ROUTES


// function to be used in the .get("/todos"..) route
function escapeRegex(name) {
    return name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function orderTodos(callback){

  console.log('3');
  Todo.aggregate([
        {
          $match: {stateNumber: {$nin: [1,2,3]}}
        },
        {
          $project:
              {
                name:1,
                priority:1,
                priorityNumber:1,
                processType:1,
                office:1,
                assignUser:1,
                dateEndProcess:1,
                dateDelivery:1,
                createAt:1,
                client:1,
                dateDelivery:1,
                tiempoRestante: {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                stateNumber:1
              }
        },
        {
          $sort: {"client.clientTypeNumber":1, priorityNumber: 1 , tiempoRestante: 1}
        }
        ], function(err, todos){
    if(err){
      console.log(err);
      return callback(err);
    } else {
      callback(null, todos);
    }
  });
}

function orderTodosByName(name, callback){
  console.log('3bis');
  Todo.aggregate([
        {
          $match: {
              $and: [
                        {stateNumber: {$nin: [1,2,3]}},
                        {'assignUser.username': name}
                    ]
            }
        },
        {
          $project:
              {
                name:1,
                priority:1,
                priorityNumber:1,
                processType:1,
                office:1,
                assignUser:1,
                dateEndProcess:1,
                dateDelivery:1,
                createAt:1,
                client:1,
                dateDelivery:1,
                tiempoRestante: {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                stateNumber:1
              }
        },
        {
          $sort: {"client.clientTypeNumber":1, priorityNumber: 1 , tiempoRestante: 1}
        }
        ], function(err, todos){
    if(err){
      console.log(err);
      return callback(err);
    } else {
      callback(null, todos);
    }
  });
}

function searchByName(name, callback){
  console.log('3tris');
  Todo.aggregate([
        {
          $match: { name: { $regex: name, $options: 'gi' } }
        },
        {
          $project:
              {
                name:1,
                priority:1,
                priorityNumber:1,
                processType:1,
                office:1,
                assignUser:1,
                dateEndProcess:1,
                dateDelivery:1,
                createAt:1,
                client:1,
                dateDelivery:1,
                tiempoRestante: {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                stateNumber:1
              }
        }
        ], function(err, todos){
    if(err){
      console.log(err);
      return callback(err);
    } else {
      console.log(todos);
      callback(null, todos);
    }
  });
}


router.get("/", function(req, res){
  console.log('2');
  if(req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword), 'gi');
    searchByName(regex, function(err, todos){
      if(req.xhr) {
        if(req.user){
            res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
        }else{
            res.json({todos:todos});
        }
      }
    });
  } else if(req.query.name && req.query.name !== 'Todos') {
      orderTodosByName(req.query.name,function(err,todos){
        if(err){
          console.log(err);
        } else {
          res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
        }
      });
    } else {
      console.log('7');
      orderTodos(function(err, todos){
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
          res.render("index", {todos: todos});
        }
      }
    });
  }
});

// app.get("/todos/new", function(req, res){
//  res.render("new");
// });

router.post("/", middleware.isLoggedIn, function(req, res){
  console.log('1');
 req.body.todo.name = req.sanitize(req.body.todo.name);
 var formData = req.body.todo;

 switch(formData.clientTypeNumber){
   case "1":
             formData.clientType = "Platino";
             break;
   case "2":
             formData.clientType = "Oro";
             break;
   case "3":
             formData.clientType = "Plata";
             break;
   case "4":
             formData.clientType = "Bronce";
             break;
   case "5":
             formData.clientType = "Estrategico/Clave";
             break;
   case "6":
             formData.clientType = "A exito";
             break;
 }

 //Creamos objeto con datos del cliente del formulario
 var clientData = {
   name : formData.client,
   clientType: formData.clientType,
   clientTypeNumber : formData.clientTypeNumber
 }
 switch(formData.priorityNumber){
  case "1":
            formData.priority = "Alta";
            break;
  case "2":
            formData.priority = "Media";
            break;
  case "3":
            formData.priority = "Baja";
            break;
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
       Client.find({ name : clientData.name}, function(err, client){
         if(err){
            console.log(err);
         } else {
           if(client.length){ //Si encuentra al cliente, setea los datos en el objeto
             formData.client = {
                 id : client[0]._id,
                 name : client[0].name,
                 clientType: client[0].clientType,
                 clientTypeNumber : client[0].clientTypeNumber
             }
             Todo.create(formData, function(err, newTodo){ //Crea el proceso sin actualizar los datos del cliente
                if(err){
                  console.log(err);
                } else {
                  orderTodos(function(err, todos){
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
             Client.create(clientData, function(err, newClient){
               if(err){
                  console.log(err);
               } else {
                  formData.client = {
                      id : newClient._id,
                      name : newClient.name,
                      clientType: newClient.clientType,
                      clientTypeNumber : newClient.clientTypeNumber
                  }
                  Todo.create(formData, function(err, newTodo){//crea el proceso luego de crear el cliente
                     if(err){
                       console.log(err);
                     } else {
                       orderTodos(function(err, todos){
                         if(err){
                           console.log(err);
                         }else{
                           res.json({todos:todos, id:req.user._id, isAdmin: req.user.isAdmin});
                         }
                       });
                       //res.json(newTodo);
                     }
                  });
              }
             });
           }
         }
       }).limit(1);
     }
  }
 });
});

router.get("/:id", function(req, res){
  console.log('todos/id');
 Todo.findById(req.params.id, function(err, todo){
   if(err){
     console.log(err);
     res.redirect("/")
   } else {
      if(req.xhr) {
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
               orderTodos(function(err, todos){
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
        orderTodos(function(err, todos){
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
