var express = require("express");
var router = express.Router();
var Client = require("../models/client");
var functions = require("./functions.js");



router.get("/", function(req, res){

    if (req.query.name) {
        Client.findOne({ name: req.query.name}, function (err, client) {
            if (err) {
                console.log(err);
            } else {
                res.json(client);
            }
        });
    } else {
        Client.find({}, function (err, clients) {
            if (err) {
                console.log(err);
            } else {
                res.json(clients);
            }
        });
    }
});

router.put("/", function(req, res){
  
    if (typeof req.body.clientData.name === 'undefined') {
        return false
    } else {
        req.body.clientData.name = req.sanitize(req.body.clientData.name);
        if (req.body.clientData.name.trim().length == 0) {
            return false;
        }
    }

    var formData = req.body.clientData;
    formData.clientType = functions.setClientType(formData.clientTypeNumber);
     
    
    Client.findOne({name:formData.name}, function (err,clientFound) {
        if (err) {
            console.log(err);
        } else {
            if (clientFound) {
                return false;
            }
            
            Client.create(formData, function (err, client) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(client);
                }
            });        
        }
    });
});

module.exports = router;
