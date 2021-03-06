require('./config_files/config');

var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

const fs = require('fs');

const port = process.env.PORT;

app.locals.moment = require('moment');

var uriConnect = `mongodb://${process.env.userdb}:${process.env.passdb}@${process.env.uriConnect}`
mongoose.connect(uriConnect, {useMongoClient: true});
//mongoose.connect("mongodb://localhost/todo_app");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride('_method'));

var Todo = require("./models/todo");
var Client = require("./models/client");
var User = require("./models/user");
var State = require("./models/todo_state");

// UserSchema.plugin(passportLocalMongoose);

//Requering Routes
var todoRoutes = require("./routes/todos");
var clientRoutes = require("./routes/clients");
var userRoutes = require("./routes/users");
var indexRoutes = require("./routes/index");
var stateRoutes = require("./routes/todo_state");

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
app.use("/todos/:id/states", stateRoutes);





app.listen(port, function () {
    console.log(`Started on port ${port}`);
});
