var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require('method-override');
    moment = require('moment');

mongoose.connect("mongodb://localhost/todo_app");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride('_method'));

var todoSchema = new mongoose.Schema({
  name: String,
  client: {
        id: { type: mongoose.Schema.Types.ObjectId,
              ref: "Client"},
        name: String,
        clientType: String,
        clientTypeNumber: Number
          },
  priority: String,
  priorityNumber: Number,
  createAt: {type: Date, default: Date.now },
  dateDelivery: {type: Date, default: Date.now },
  dateEndProcess:  {type: Date, default: Date.now },
  office: String,
  comments: String,
  createUser: String,
  assignUser: String,
  processType: String,
  state: String
});

var clientSchema = new mongoose.Schema({
  name: String,
  clientType: String,
  clientTypeNumber: Number
});

// var userSchema = new mongoose.Schema({
//   username: String,
//   firstname: String,
//   lastname: String,
//   office: {
//             id: { type: mongoose.Schema.Types.ObjectId,
//                   ref: "Office" },
//             name: String
//               }
// });

// var officeSchema = new mongoose.Schema({
//   name: String
// });

var Todo = mongoose.model("Todo", todoSchema);
var Client = mongoose.model("Client", clientSchema);
// var User = mongoose.model("User", userSchema);
// var Office = mongoose.model("Office", officeSchema);

app.get("/", function(req, res){
  res.redirect("/todos");
});

// function to be used in the .get("/todos"..) route
function escapeRegex(name) {
    return name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function orderTodos(req, res){
  Todo.aggregate([
        {
          $project:
              {
                name:1,
                priority:1,
                priorityNumber:1,
                office:1,
                assignUser:1,
                dateEndProcess:1,
                dateDelivery:1,
                createAt:1,
                client:1,
                dateDelivery:1,
                tiempoRestante: {
                        $subtract: [ "$dateDelivery" , new Date() ]
                        }
              }
        },
        {
          $sort: {"client.clientTypeNumber":1, priorityNumber: 1 , tiempoRestante: 1}
        }
        ], function(err, todos){
    if(err){
      console.log(err);
    } else {
      if(req.xhr) {
        console.log(todos);
        res.json(todos);
      } else {
        res.render("index", {todos: todos});
      }
    }
  });
}

app.get("/todos", function(req, res){
  if(req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword), 'gi');
    Todo.find({ name: regex }, function(err, todos){
      if(err){
        console.log(err);
      } else {
        res.json(todos);
      }
    });
  } else {
    orderTodos(req, res);
  }
});

app.get("/todos/new", function(req, res){
 res.render("new");
});

app.post("/todos", function(req, res){
 req.body.todo.name = req.sanitize(req.body.todo.name);

 var formData = req.body.todo;

 switch(formData.clientTypeNumber){
   case "1":
             formData.clientType = "Oro";
             break;
   case "2":
             formData.clientType = "Plata";
             break;
   case "3":
             formData.clientType = "Bronce";
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
console.log("FormData3");
console.log(formData);
console.log(clientData);

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
            res.render("new");
          } else {
            console.log('Nuevo TOdo');
            console.log(newTodo);
            res.json(newTodo);
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
            console.log('Crear TODO');
            console.log('FormData');
            console.log(formData);
            console.log('newClient');
            console.log(newClient);
            Todo.create(formData, function(err, newTodo){//crea el proceso luego de crear el cliente
               if(err){
                 res.render("new");
               } else {
                 console.log('Nuevo TOdo');
                 console.log(newTodo);
                 res.json(newTodo);
               }
            });
        }
       });
     }

   }

 }).limit(1);

});

app.get("/todos/:id", function(req, res){
console.log('Todos/id')  ;
console.log(req.params.id);
 Todo.findById(req.params.id, function(err, todo){
   if(err){
     console.log(err);
     res.redirect("/")
   } else {
     console.log("Busca un todo");
     console.log(todo);
      if(req.xhr) {
        res.json(todo);
      } else {
        res.render("edit", {todo: todo});
      }
   }
 });
});


app.get("/client", function(req, res){
    console.log('recibe la llamada');
    Client.find({},{name : 1}, function(err, clients){
      if(err){
        console.log(err);
      } else {
        console.log(clients);
        res.json(clients);
      }
    });
});

app.put("/todos/:id", function(req, res){
  console.log('req.params.id');
  console.log(req.params);
  console.log('req.body.todo');
  console.log(req.body.todo);
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
  // switch(req.body.todo.clientTypeNumber){
  //   case "1":
  //             req.body.todo.clientType = "Oro";
  //             break;
  //   case "2":
  //             req.body.todo.clientType = "Plata";
  //             break;
  //   case "3":
  //             req.body.todo.clientType = "Bronce";
  //             break;
  // }
  console.log('req.body.todo2');
  console.log(req.body.todo);
 Todo.findByIdAndUpdate(req.params.id, req.body.todo, {new: true}, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});

app.delete("/todos/:id", function(req, res){
 Todo.findByIdAndRemove(req.params.id, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});

//Conexion a Cloud9
// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log('The server has started ..');
// });

app.listen(3000, function() {
  console.log('Server running on port 3000');
});
