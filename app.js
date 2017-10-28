var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

app.locals.moment = require('moment');

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
  dateDelivered: {type: Date, default: Date.now },
  office: String,
  comments: String,
  createUser: String,
  assignUser: {
           id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
           },
           username: String
  },
  closeOrigin: Number,
  processType: String,
  stateNumber: Number
});

var clientSchema = new mongoose.Schema({
  name: String,
  clientType: String,
  clientTypeNumber: Number
});

var UserSchema = new mongoose.Schema({
    username: {type:String, unique:true, required:true },
    password: String,
    avatar: String,
    firstname: String,
    lastname: String,
    email: {type:String, unique:true, required:true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

var Todo = mongoose.model("Todo", todoSchema);
var Client = mongoose.model("Client", clientSchema);
var User = mongoose.model("User", UserSchema);
// var User = mongoose.model("User", userSchema);
// var Office = mongoose.model("Office", officeSchema);

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});


app.get("/", function(req, res){
  res.redirect("/todos");
});

// function to be used in the .get("/todos"..) route
function escapeRegex(name) {
    return name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function orderTodos(callback){

  console.log('13');
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

app.get("/todos", function(req, res){
  console.log('2');
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
      console.log('7');
      orderTodos(function(err, todos){
      if(err){
        console.log(err);
      } else {
        // console.log(todos);
        if(req.xhr) {
          res.json(todos);
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

app.post("/todos",isLoggedIn, function(req, res){
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

app.get("/todos/:id", function(req, res){
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


app.get("/client", function(req, res){
    console.log('recibe la llamada');
    if(req.query.name) {
      Client.find({name: req.query.name},{ clientTypeNumber: 1}, function(err, client){
        if(err){
          console.log(err);
        } else {
          console.log(client);
          res.json(client);
        }
      });
    } else {
      Client.find({},{name : 1}, function(err, clients){
        if(err){
          console.log(err);
        } else {
          console.log(clients);
          res.json(clients);
        }
      });
    }
});


app.put("/todos/:id",checkProcessOwnership, function(req, res){
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

app.delete("/todos/:id",checkProcessOwnership, function(req, res){
 Todo.findByIdAndRemove(req.params.id, function(err, todo){
   if(err){
     console.log(err);
   } else {
      res.json(todo);
   }
 });
});


//USERS

//Show register form
app.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//Sign up logic
app.post("/register", function(req, res){
    var newUser = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === 'secretcode123'){
        newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            // req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/todos");
        });
    });
});

//Show login form
app.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//Login logic
app.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info){
        if(err){
            return next(err);
        }
        if(!user){
            return res.redirect('/todos');
        }
        req.logIn(user, function(err){
            if(err){
                return next(err);
            }
            console.log(req.session.redirectTo);
            var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/todos' ;
            delete req.session.redirectTo;
            res.redirect(redirectTo);
        });
    })(req, res, next);
});


//Logout logic
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/todos");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // console.log(req.originalUrl);
    // req.session.redirectTo = req.originalUrl;
    res.redirect("/todos");
}

function checkProcessOwnership(req,res, next) {
    if(req.isAuthenticated()){
        Todo.findById(req.params.id, function(err, foundTodo){
            if(err){
                console.log(err);
            } else {
                //Does the user own the campground?
                if(foundTodo.assignUser.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    console.log('No tiene permiso para realizar estos cambios');
                }
            }
        });
    } else {
        console.log('Necesitas estar logueado para realizar estos cambios');
    }
}

//Conexion a Cloud9
// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log('The server has started ..');
// });

app.listen(3000, function() {
  console.log('Server running on port 3000');
});
