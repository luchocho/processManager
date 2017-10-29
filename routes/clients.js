var express = require("express");
var router = express.Router();
var Client = require("../models/client");


router.get("/", function(req, res){
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

module.exports = router;
