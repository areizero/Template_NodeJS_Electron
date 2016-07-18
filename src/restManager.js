module.exports = {
    exposeServices: function() {
        var api = require('express');
        var bodyParser = require('body-parser');    //middleware of management of data from Front End
        var app = api();
        /*Body parser config*/
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        /*Own logic objects*/
        var persistence = require('./dao/persistence.js');
        var Person = require('./dao/data/person.js');
        var dbCon;  //database conection variable

        //best practices of mongo connection
        var mongodb = require('mongodb');   //MongoDB module in NodeJS
        var MongoClient = mongodb.MongoClient;
        MongoClient.connect(process.env.MONGO_MYDB_URL, function(err, database) {
            services(err);  //calling my own function
            if(err){
                console.log("Can't set connection to MongoDB " + process.env.MONGO_MYDB_URL);
                console.log(err);
                return;
            }
            console.log('Connection to MongoDB seted ' + process.env.MONGO_MYDB_URL);
            dbCon = database;   // connection object (maybe a Singleton can work!)
            app.listen(process.env.APP_SERVICES_PORT);
            console.log('Express services listening in port ' + process.env.APP_SERVICES_PORT);
        });

        /*Services deployment*/
        var services = function(err){
            if(err){
                console.log('Has occurred an error in Services deployment');
                return;
            }

            //  POST method of Person
            console.log('Service deployment: POST(\'/api/persons\')');
            app.post('/api/persons', function (request, response) {
                console.log("Inside /api/persons");
                var cb = function(data){
                    if(data.res){
                        response.status(201);   //  http response for create
                        response.send(data.msg);
                        return;
                    }
                    if(data.err == 0){
                        response.status(200);
                        response.send(data.msg);
                        return;
                    }
                    response.status(500);
                    response.send(data.msg + ' Error('+data.err+')');
                };
                var personObj = new Person(request.body.name, request.body.identityCardNumber);
                personObj.setData(request.body);
                persistence.createPerson(personObj, dbCon, cb); //llamamos la clase encargda de la persistencia
            });
            console.log('Service deployment: GET(\'/api/persons\')');
            app.get('/api/persons', function (request, response) {
                console.log("Inside /api/persons GET");
            });
        }
    }
};
