var Todo = require("../models/todo");
var Client = require("../models/client");
var User = require("../models/user");


function orderTodos(callback){

  Todo.aggregate([
        {
          $match: {stateNumber: {$nin: [5,6,7]}}
        },
        {
          $lookup:
            {
              from: "users",
              localField : "assignUser.id",
              foreignField: "_id",
              as: "assignUser"
            }
        },
        {
        $unwind: "$assignUser"
        },
        {
          $project:
              {
                "name":1,
                "priority":1,
                "priorityNumber":1,
                "processType":1,
                "office":1,
                "assignUser._id":1,
                "assignUser.username":1,
                "assignUser.initials":1,
                "dateDelivery":1,
                "createAt":1,
                "client":1,
                "dateClosed":1,
                "tiempoRestante": {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                "stateNumber":1
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

function orderTodosByName( name, callback){
  Todo.aggregate([
        {
          $match: {
              $and: [
                        {stateNumber: {$nin: [5,6,7]}},
                        {'assignUser.username': name}
                    ]
            }
        },
        {
          $lookup:
            {
              from: "users",
              localField : "assignUser.id",
              foreignField: "_id",
              as: "assignUser"
            }
        },
        {
        $unwind: "$assignUser"
        },
        {
          $project:
              {
                "name":1,
                "priority":1,
                "priorityNumber":1,
                "processType":1,
                "office":1,
                "assignUser._id":1,
                "assignUser.username":1,
                "assignUser.initials":1,
                "dateDelivery":1,
                "createAt":1,
                "client":1,
                "dateClosed":1,
                "tiempoRestante": {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                "stateNumber":1
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

function searchByName(name, callback){
  Todo.aggregate([
        {
          $match: { name: { $regex: name, $options: 'gi' } }
        },
        {
          $lookup:
            {
              from: "users",
              localField : "assignUser.id",
              foreignField: "_id",
              as: "assignUser"
            }
        },
        {
        $unwind: "$assignUser"
        },
        {
          $project:
              {
                "name":1,
                "priority":1,
                "priorityNumber":1,
                "processType":1,
                "office":1,
                "assignUser._id":1,
                "assignUser.username":1,
                "assignUser.initials":1,
                "dateDelivery":1,
                "createAt":1,
                "client":1,
                "dateClosed":1,
                "tiempoRestante": {
                          $subtract: [ "$dateDelivery" , new Date() ]
                        },
                "stateNumber":1
              }
        },
        ], function(err, todos){
    if(err){
      console.log(err);
      return callback(err);
    } else {
      callback(null, todos);
    }
  });
}

module.exports = {
    orderTodos,
    orderTodosByName,
    searchByName
}
