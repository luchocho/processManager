var express = require("express");
var router = express.Router();
var Client = require("../models/client");
var functions = require("./functions.js");



router.get("/", function(req, res){
    var clientsData = functions.fetchClientsData();

    if(req.query.name) {
        console.log(clientsData);
        console.log(req.query.name);
        clientsData.forEach(function(clientData){
            if(clientData.name == req.query.name){
                clientTypeId = clientData.clientTypeId;
            }
        });

        if(typeof clientTypeId !== 'undefined'){
            Client.find({clientTypeId: clientTypeId},{ clientTypeNumber: 1}, function(err, client){
                if(err){
                    console.log(err);
                } else {
                    client[0].clientTypeId = clientTypeId;
                    res.json(client);
                }
            });
        }

    } else {
        Client.find({},{clientTypeId : 1}, function(err, clients){
            if(err){
                console.log(err);
            } else {
                clientsData.forEach(function(clientObj){
                    clients.forEach(function(client){
                        if(clientObj.clientTypeId == client.clientTypeId){
                            client.name = clientObj.name;
                        }
                    })
                });
                res.json(clients);
            }
        });
    }
});

module.exports = router;
