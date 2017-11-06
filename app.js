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

var Todo = require("./models/todo");
var Client = require("./models/client");
var User = require("./models/user");


// UserSchema.plugin(passportLocalMongoose);

//Requering Routes
var todoRoutes = require("./routes/todos");
var clientRoutes = require("./routes/clients");
var userRoutes = require("./routes/users");
var indexRoutes = require("./routes/index");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: process.env.secretsession,
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

app.use("/", indexRoutes);
app.use("/todos", todoRoutes);
app.use("/client", clientRoutes);
app.use("/user", userRoutes);





//Conexion a Cloud9
// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log('The server has started ..');
// });

app.listen(3000, function() {
  console.log('Server running on port 3000');
});
