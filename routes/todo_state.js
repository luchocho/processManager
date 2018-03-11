var express = require("express");
var router = express.Router({ mergeParams: true });
var Todo = require("../models/todo");
var State = require("../models/todo_state");
var middleware = require("../middleware");

//ROUTES

router.get("/", middleware.isLoggedIn, function (req, res) {

    // Todo.findById(req.params.id, function (err, todo) {
    Todo.findById(req.params.id).populate("state").exec(function (err, todo){
        if (err) {
            console.log(err);
        } else {
            res.json(todo);
        }
    });

});

router.post("/", middleware.checkProcessOwnership ,function (req, res) {
    //Lookup todo using Id 
    Todo.findById(req.params.id, function (err, todo) {
        if (err) {
            console.log(err);
        } else {

            //Create new state
            State.create(req.body.todo, function (err, state) {
                
                if (err) {
                    console.log(err);
                } else {
                    //save state
                    state.save(); 
                    //Connect new state to todo
                    todo.state.push(state);
                    todo.stateNumber = req.body.todo.stateId;
                    todo.save();
                    res.json({ todo_id: req.params.id, state: state });
                }
            });
        }
    });
});


module.exports = router;