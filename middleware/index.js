var Todo = require("../models/todo");


//All the middleware goes here
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // console.log(req.originalUrl);
    // req.session.redirectTo = req.originalUrl;
    res.redirect("/todos");
}

middlewareObj.checkProcessOwnership = function(req,res, next) {
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

module.exports = middlewareObj
