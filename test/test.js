var chai = require('chai');
assert = chai.assert;
setEnvVariables();  //  saving enviroment vars
var persistencia = require('../src/dao/persistence.js');
var mongoUrl = process.env.MONGO_MYDB_URL;

describe('Persistence of Person', function(){
    var Person = require('../src/dao/data/person.js');
    var mongodb;
    var MongoClient;
    var dbCon;
    //  hook: seting connection befor any test
    before(function(done) {
        mongodb = require('mongodb');   //  mongo module
        MongoClient = mongodb.MongoClient;
        MongoClient.connect(mongoUrl, function(err, database) {
            if(err){
                console.log(err);
                done();
                return;
            }
            dbCon = database;    // database conection
            done();
        });
    });
    after(function(done) {
        var cb = function(data){
            dbCon.close();
            done();
        }
        cb();
        /*var datoBusqueda = {test: true};
        persistencia.removeProducto(datoBusqueda, dbCon, cb);*/
    });
    //  Create test
    it('MUST return data.res equal true WHEN Person has been created in the Data Base',function(done){
        var cb = function(data){
            assert.equal(data.res, true);
            done();
        };
        var person = new Person('Pedro Poncher', '123Test');
        var testData = {
            email: "pedroponcher.test@areizero.com",
            address: "",
            telephone: "+60-847-98-78"
        };
        person.setData(testData);
        person.test = true;
        persistencia.createPerson(person, dbCon, cb);
    });
});

//  util functions
function setEnvVariables(){
    process.env.MONGO_MYDB_URL = 'mongodb://' + 'localhost:27017' + '/' + 'templateDB'; //  url to Mongo
    process.env.APP_SERVICES_PORT = 8888;
}
var isArray = function(obj){
    if(Object.prototype.toString.call(obj) === '[object Array]'){
        return true;
    }
    return false;
}
