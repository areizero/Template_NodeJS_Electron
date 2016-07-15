module.exports = {
    exposeServices: function() {
        var api = require('express');
        var bodyParser = require('body-parser'); //middleware para manejo de datos enviados desde front-end

        var app = api();
        //configuramos el body parser en el app de express
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        var persistence = require('./dao/persistence.js');
        var Productor = require('../src/productor.js');
        var Compra = require('../src/compra.js');
        var AnalisisCafeCereza = require('../src/analisisCafeCereza.js');
        var Liquidacion = require('../src/liquidacion.js');
        var dbCon; //var for control the database conection

        var services = function(err){
            if(err){
                console.log('Ha ocurrido un error desplegando los servicios');
                return;
            }

            /*Subiendo servicios para Productor*/
            //post method para el servicio crear productor
            console.log('Subiendo servicio  app.post(\'/api/productores)\'');
            app.post('/api/productores', function (request, response) {
                //usamos los datos del request enviado por AJAX en JQuery
                var productorData = new Productor(request.body.pCNumber, request.body.pCType);
                productorData.nombre = request.body.pName;
                productorData.direccion = request.body.pDir;
                productorData.ubicacion = request.body.pUbicacion;

                var postCb = function(data){
                    //en caso de que algun error halla sucedido retorno la respuesta dada por la llamada
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);
                        return;
                    }
                    //retorno el objeto encontrado
                    response.status(201);
                    response.send(data[0]);
                    return;
                }

                //console.log('invocando la creacion de productoren persistencia');
                persistence.dbCreateProductor(productorData, dbCon, postCb); //llamamos la clase encargda de la persistencia
            });

            //get
            console.log('Subiendo servicio  app.get(\'/api/productores)\'');
            app.get('/api/productores', function (request, response) {
                //usamos los datos del request enviado por AJAX en JQuery
                var doc = request.query.docNumber;
                var docTipo = request.query.docType;
                //controlamos las respuesta obtenida mediante un CB
                var getCb = function(data){
                    //en caso de que algun error halla sucedido retorno la respuesta dada por la llamada
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);
                        return;
                    }
                    //retorno el objeto encontrado
                    if(data.length > 0){
                        response.status(200);
                        response.send(data[0]);
                        return;
                    }
                    //retorno el codigo que indica que no se encontraron objetos
                    response.sendStatus(204);
                }
                if(doc == undefined || docTipo == undefined || doc == null || docTipo == null || doc == '' || docTipo == ''){
                    response.status(400);
                    response.send('Numero de documento o tipo de documento no pueden ser vacios');
                    return;
                }
                persistence.dbFindProductorByDocument(doc, docTipo, dbCon, getCb);
            });

            //update
            console.log('Subiendo servicio  app.put(\'/api/productores/:id)\'');
            app.put('/api/productores/:id', function (request, response) {
                //usamos los datos del request enviado por AJAX en JQuery para crear el productor
                var productor = new Productor(request.body.docNumero, request.body.docTipo);
                productor._id = request.params.id;
                productor.nombre = request.body.nombre;
                productor.direccion = request.body.direccion;
                productor.ubicacion = request.body.ubicacion;
                //controlamos las respuesta obtenida mediante un CB
                var cb = function(data){
                    //retorno de lo que halla contestado el update
                    //console.log("Retorno al cliente: " + JSON.stringify(data));
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);
                    }
                }
                //realizamos el update y procesamos el resultado mediante el CallBack
                persistence.dbUpdateProductor(productor, dbCon, cb);
                //persistence.dbFindProductorByDocument(doc, docTipo, dbCon, getCb);
            });

            /*Subiendo servicios para Compra*/
            //post method para el servicio crear compra
            console.log('Subiendo servicio  app.post(\'/api/productores/:id/compras)\'');
            app.post('/api/productores/:id/compras', function (request, response) {
                //usamos los datos del request enviado por AJAX en JQuery
                /*CBs*/
                //CB de retorno
                var cbRet = function(data){
                    //retornamos el data dado, como respuesta
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);

                        //incrementamos la secuencia de la compra
                        var next = data.message.numeroRemision;
                        persistence.setSequence('compraNumeroRemision', next, dbCon, function(){});
                        return;
                    }
                    //retorno error debido a que no se obtuvo el data adecuado
                    response.status(500);
                    response.send('A ocurrido un error interno');
                }
                //cb para ingresar la compra
                var ingCompra = function(numRem){
                    var idProductor = request.params.id;
                    var compra = new Compra(numRem);
                    compra.setData(request.body);
                    compra._productorId = idProductor;
                    var parametros = {
                        factorRendimiento: request.body['parametros[factorRendimiento]'],
                        valorServicioBeneficio: request.body['parametros[valorServicioBeneficio]'],
                        valorFlete: request.body['parametros[valorFlete]'],
                        valorCompra: request.body['parametros[valorCompra]'],
                        valorCompraPasilla: request.body['parametros[valorCompraPasilla]'],
                        factorCalculoAlmendra: request.body['parametros[factorCalculoAlmendra]'],
                        factorCalculoRendimiento: request.body['parametros[factorCalculoRendimiento]']
                    };
                    compra.parametros = parametros;
                    /*var analisisCafe = new AnalisisCafeCereza();
                    analisisCafe.setData(request.body.analisisCereza);
                    compra.analisisCafeCereza = analisisCafe;*/
                    //console.log('invocando la creacion de productoren persistencia');
                    //cb para buscar la compra tras ingresada
                    var cbFind = function(data){
                        if(data.code == 200){
                            persistence.dbFindCompraByRemision(numRem, dbCon, cbRet);
                            return;
                        }
                        cbRet(data);
                    };
                    persistence.dbCreateCompra(compra, dbCon, cbFind); //llamamos la clase encargda de la persistencia
                }
                //cb para comprobar consecutivo de Remision
                var cbSequence = function(res){
                    //console.log(JSON.stringify(res));
                    //en caso de que se halla encontrado resultado
                    if(res.code){
                        var numRemision = res.message;
                        ingCompra(numRemision);
                        return;
                    }
                    cbRet({code:500, message:res.message});
                }
                persistence.getNextSequence('compraNumeroRemision', dbCon, cbSequence);
            });

            console.log('Subiendo servicio  app.get(\'/api/productores/:id/compras)\'');
            app.get('/api/productores/:id/compras', function (request, response) {
                var cb = function(data){
                    if(data.respuesta){
                        if(data.mensaje.length > 0){
                            response.status(200);
                            response.send(data.mensaje);
                            return;
                        }
                        response.status(204);
                        response.send('No se hall&oacute; ning&uacute;n dato');
                        return;
                    }
                    response.status(500);
                    response.send(data.mensaje);
                };
                var datoBusqueda = request.query;
                datoBusqueda._productorId = request.params.id;
                persistence.getCompra(datoBusqueda, dbCon, cb);
            });

            console.log('Subiendo servicio  app.put(\'/api/productores/:id/compras/:numRem)\'');
            app.put('/api/productores/:id/compras/:numRem', function (request, response) {
                //cb para dar respuesta
                var cb = function(data){
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);
                    }
                }
                var cbCC = function(dataCC){
                    if(dataCC.code == 200){
                        persistence.dbFindCompraByRemision(request.params.numRem, dbCon, cb);
                    }
                    else{
                        cb(dataCC);
                    }
                }
                var dataModify = request.body;
                if(dataModify['parametros[factorRendimiento]'] != undefined && dataModify['parametros[factorRendimiento]'] != null){
                    var parametros = {
                        factorRendimiento: request.body['parametros[factorRendimiento]'],
                        valorServicioBeneficio: request.body['parametros[valorServicioBeneficio]'],
                        valorFlete: request.body['parametros[valorFlete]'],
                        valorCompra: request.body['parametros[valorCompra]'],
                        valorCompraPasilla: request.body['parametros[valorCompraPasilla]'],
                        factorCalculoAlmendra: request.body['parametros[factorCalculoAlmendra]'],
                        factorCalculoRendimiento: request.body['parametros[factorCalculoRendimiento]']
                    };
                    dataModify.parametros = parametros;
                    delete dataModify['parametros[factorRendimiento]'];
                    delete dataModify['parametros[valorServicioBeneficio]'];
                    delete dataModify['parametros[valorFlete]'];
                    delete dataModify['parametros[valorCompra]'];
                    delete dataModify['parametros[valorCompraPasilla]'];
                    delete dataModify['parametros[factorCalculoAlmendra]'];
                    delete dataModify['parametros[factorCalculoRendimiento]'];
                }
                var dataFind = {"numeroRemision": parseInt(request.params.numRem)};
                persistence.dbUpdateCompra(dataFind, dataModify, dbCon, cbCC);
            });

            //update
            console.log('Subiendo servicio  app.post(\'/api/productores/:id/compras/:numRem/analisis)\'');
            app.post('/api/productores/:id/compras/:numRem/analisis', function (request, response) {
                //cb para dar respuesta
                var cb = function(data){
                    if(data.code != undefined){
                        response.status(data.code);
                        response.send(data.message);
                    }
                }
                //usamos los datos del request enviado por AJAX en JQuery para crear la compra
                var analisis = new AnalisisCafeCereza();
                analisis.setData(request.body);
                //cb tras realizar valores autocalculados
                var cbCalculo = function(data){
                    analisis = data.mensaje;
                    //callback para indicar que se realizo el analisis cafe cereza, basicamente rebuscara la compra y la retornara
                    var cbCC = function(dataCC){
                        if(dataCC.code == 200){
                            persistence.dbFindCompraByRemision(request.params.numRem, dbCon, cb);
                            return;
                        }else{
                            cb(dataCC);
                        }
                    }
                    persistence.setAnalisisCafeCereza(request.params.numRem, analisis, dbCon, cbCC);
                }
                analisis.realizarCalculos(cbCalculo); //se realiza internamente los calculo y se asignan los valores correspondientes
            });

            console.log('Subiendo servicio  app.post(\'/api/productores/:id/compras/:numRem/liquidacion)\'');
            app.post('/api/productores/:id/compras/:numRem/liquidacion', function (request, response) {
                //cb para dar respuesta
                var cb = function(data){
                    if(data.respuesta){
                        response.status(200);
                        response.send(data.mensaje);
                        return;
                    }
                    response.status(500);
                    response.send(data.mensaje);
                };
                var createLiquidacion = function(data){
                    if(data.code == 200 || data.code == 204){
                        persistence.getCompra({"numeroRemision": parseInt(request.params.numRem)}, dbCon, function(com){
                            var compra = com.mensaje[0];
                            var liquid = new Liquidacion(compra.numeroRemision);
                            liquid.calcularLiquidacion(compra);
                            persistence.createLiquidacion(liquid, dbCon, cb);
                        });
                        return;
                    }
                    response.status(data.code);
                    response.send(data.message);
                }
                var dataFind = {"numeroRemision": parseInt(request.params.numRem)};
                var dataModify = {"estado": "LIQUIDADA"};
                persistence.dbUpdateCompra(dataFind, dataModify, dbCon, createLiquidacion);
            });

            console.log('Subiendo servicio  app.get(\'/api/productores/:id/compras/:numRem/liquidacion)\'');
            app.get('/api/productores/:id/compras/:numRem/liquidacion', function (request, response) {
                var cb = function(data){
                    if(data.respuesta){
                        response.status(200);
                        response.send(data.mensaje);
                        return;
                    }
                    response.status(500);
                    response.send(data.mensaje);
                };
                //realizamos los calculos para liquidacion
                var getLiquidacion = function(data){
                    if(data.respuesta){
                        if(data.mensaje.length > 0){
                            var compra = data.mensaje[0];
                            var liquid = new Liquidacion(compra.numeroRemision);
                            liquid.calcularLiquidacion(compra);
                            cb({respuesta: true, mensaje: liquid});
                            return;
                        }
                    }
                    cb(data);
                };
                //buscamos la compra
                var datoBusqueda = {numeroRemision: parseInt(request.params.numRem)};
                persistence.getCompra(datoBusqueda, dbCon, getLiquidacion);
            });

            console.log('Subiendo servicio  app.get(\'/api/compras)\'');
            app.get('/api/compras', function (request, response) {
                var cb = function(data){
                    if(data.respuesta){
                        if(data.mensaje.length > 0){
                            response.status(200);
                            response.send(data.mensaje);
                            return;
                        }
                        response.status(204);
                        response.send('No se hall&oacute; ning&uacute;n dato');
                        return;
                    }
                    response.status(500);
                    response.send(data.mensaje);
                };
                var setProductor = function(data){
                    if(data.respuesta){
                        var msg = data.mensaje;
                        if(msg.length > 0){
                            //solo lo hare para el primer dato ya que con mas datos hay problema con la sicronicacion del for, no necesario la implementacion para varios, aunque podria haber problemas de escabilidad
                            var cbSet = function(pdata){
                                if(pdata.respuesta){
                                    if(pdata.mensaje.length > 0){
                                        msg[0].productor = pdata.mensaje[0];
                                    }
                                }
                                data.mensaje = msg;
                                cb(data);
                                return;
                            }
                            var pBusqueda = {_id: msg[0]._productorId};
                            persistence.getProductor(pBusqueda, dbCon, cbSet);
                        }
                        else{
                            cb(data);
                            return;
                        }
                    }
                    else{
                        cb(data);
                        return;
                    }
                }
                var datoBusqueda = request.query;
                if(datoBusqueda.numeroRemision != undefined)
                    datoBusqueda.numeroRemision = parseInt(datoBusqueda.numeroRemision);
                persistence.getCompra(datoBusqueda, dbCon, setProductor);
            });
        }

        //buenas practicas para la conexion a BD mongo
        var mongodb = require('mongodb'); //usamos el modulo de mongo para realizar las acciones pertinentes a bd
        var MongoClient = mongodb.MongoClient;
        MongoClient.connect(process.env.MONGO_MYDB_URL, function(err, database) {
            if(err){
                console.log('No pudo establecerse conexion con el cliente mongo ' + process.env.MONGO_MYDB_URL);
                console.log(err);
                services(err);
                return;
            }
            console.log('Se establecio conexion con DB ' + process.env.MONGO_MYDB_URL);
            dbCon=database;    //establecemos la base de datos para nor ealizar mas conexiones de las necesarias
            app.listen(process.env.APP_SERVICES_PORT);
            console.log('Express services escuchando por el puerto ' + process.env.APP_SERVICES_PORT);
            services(err);
        });
    }
};
