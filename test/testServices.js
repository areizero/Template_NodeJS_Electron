var chai = require('chai');
var supertest = require("supertest");   //  service consumer module (HTTP Request lib)
assert = chai.assert;
setEnvVariables();  //  saving enviroment vars

//  will test the service, before it you must deploy application with Electron - NodeJS (try 'electron .' (without Apostrophe) in root directory)
describe("REST Services", function(){
    var serverAgent;    //instancia que llamara los servicios
    var port = process.env.APP_SERVICES_PORT;
    var getId;
    if(port == undefined || port == null|| port == false)
        port = 8888;

    before(function(done){
        console.log('supertest.agent("http://localhost:"+'+port+');');
        serverAgent = supertest.agent("http://localhost:"+port);
        //server();
        done();
    });
    it('MUST response code 201 when POST of Person is complete',function(done){
        var testData = {
            name: "PetterParv Test API",
            identityCardNumber: "123 Test API",
            email: "petterparv.test@areizero.com",
            address: "",
            test: true
        };
        console.log("serverAgent");
        console.log(serverAgent);
        //  calling service
        serverAgent.post('/api/persons').send(testData)
        .expect("Content-type",/json/)
        .expect(201)
        .end(function(err,res){
            if(err){
                console.log("Error in test");
                console.log("error "+err);
                return;
            }
            assert.equal(res.status, 201);
            done();
        });
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
