var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
// var async = require("async");
// var nodemailer = require("nodemailer");
// var crypto = require("crypto");


router.get("/", function(req, res){
  res.redirect("/todos");
});

//Show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//Sign up logic
router.post("/register", function(req, res){
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
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//Login logic
router.post('/login', function(req, res, next){
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
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/todos");
});

module.exports = router;
