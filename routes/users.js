var express = require("express");
var router = express.Router();
var User = require("../models/user");


router.get("/", function(req, res){
  console.log('recibe la llamada');
  User.find({},{username : 1}, function(err, users){
    if(err){
      console.log(err);
    } else {
      console.log(users);
      res.json(users);
    }
  });
});

module.exports = router;
