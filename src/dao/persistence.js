//Exportamos solo como funciones, no es necesario que Persistence sea un objeto; otra forma de usar module.exports
module.exports = {
    //tambien podria usar exports.dbCreateProductor
    dbCreateProductor: function (productor, dbConection, cb){
        if(productor == undefined || productor == null){
            cb({code:400, message:'El objeto indicado es invalido, productor es un dato mal formado'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }

        var collection = dbConection.collection('productores');
        var dataId = false;

        var insert = function(getRes){
            //si ya se encontro el productor lo retornamos
            if(getRes.code == undefined && getRes.length > 0){
                cb({code:200, message: getRes[0]});
                return;
            }
            //realizamos el insert
            collection.insert(productor, function (err, result){
            if (!err){
                //console.log('Insertados ' + result.insertedCount + ' datos');
                //console.log('Ids insertados ' + JSON.stringify(result.insertedIds) + ' datos');
                console.log('Objeto insertado ' + JSON.stringify(result.ops) + ' datos');
                cb(result.ops);
            }
            else{
                //console.log('Sucedio un error ' + err);
                cb({code:500, message:err});
            }
        });
        }

        //buscamos el productor por documento para no repetir
        mongoFindJson = {documentoNumero: productor.documentoNumero, documentoTipo: productor.documentoTipo};
        collection.find(mongoFindJson).toArray(function (err, result) {
            if (!err) {
                insert(result);
            } else {
                insert({code:500, message:err});
            }
        });
    },

    dbFindProductorByDocument: function (docNumber, docType, dbConection, cb){
        if(docNumber == undefined || docType == undefined || docNumber == null || docType == null || docNumber == '' || docType == ''){
            cb({code:400, message:'Numero de documento o tipo de documento no pueden ser vacios'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }

        var collection = dbConection.collection('productores');
        //indicamos los criterios de busqueda en un json
        mongoFindJson = {documentoNumero: docNumber, documentoTipo: docType};
        //obtenemos los datos (y convertimos el cursor en array)
        collection.find(mongoFindJson).toArray(function (err, result) {
            if (!err) {
                cb(result);
                //dbConection.close();
            } else {
                cb({code:500, message:err});
            }
        });
    },

    dbUpdateProductor: function (productor, dbConection, cb){
        if(productor == undefined || productor == null){
            cb({code:400, message:'Debe indicar el productor por actualizar'});
            return;
        }
        if(productor._id == undefined || productor._id == null){
            cb({code:400, message:'No se ha indicado el id por actualizar'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }

        var collection = dbConection.collection('productores');
        //indicamos los criterios de busqueda en un json
        //console.log(JSON.stringify(productor));
        var mongoUpdateJson = {nombre: productor.nombre, ubicacion: productor.ubicacion, direccion: productor.direccion};
        //console.log(JSON.stringify(mongoUpdateJson));

        var mongodb = require('mongodb'); //usamos el modulo de mongo para poder crear un objeto de id
        var oId = new mongodb.ObjectID(productor._id);  //objeto necesario si se usa el id para una operacion de update, get o delete
        //usamos {w:1} para obtener una respuesta, esto debe hacerse en updates y deletes
        collection.update({_id: oId}, {$set: mongoUpdateJson}, {w:1}, function(err, res){
            //console.log(res.result);
            //console.log(res.result.ok + ' ' + isNaN(res.result.ok)); console.log(res.result.nModified + ' ' + isNaN(res.result.nModified)); console.log(res.result.n + ' ' + isNaN(res.result.n));
            if (err) {
                cb({code:500, message:err});
            }
            //se modifico algun campo de al menos nModified documentos
            else if (res.result.ok > 0 && res.result.nModified > 0) {
                //el documento fue actualizado
                cb({code:200, message: productor}); //quizas sea mejor si se realiza un find pero de igual forma debe funcionar
            }
            //se intento modificar n documentos pero ningun campo habia sido manipulado
            else if (res.result.ok > 0 && res.result.n > 0) {
                cb({code:202, message: 'Ningun campo del productor a sido modificado'});
            }
            else {
                cb({code:204, message: 'No se encontro ningun documento con el id indicado'});
            }
        });
    },

    getProductor: function(busquedaData, dbConection, cb){
        if(dbConection == undefined || dbConection == null){
            res = false;
            msg = -2;
            cb({respuesta: res, mensaje: msg});
            return false;
        }
        var ret = function(){
            if(cb != undefined)
                cb({respuesta: res, mensaje: msg});
            return res;
        };
        var collection = dbConection.collection('productores');
        var mongoFind = busquedaData;
        if(mongoFind == undefined || mongoFind == null || mongoFind == '')
            mongoFind = {};
        if(mongoFind._id != undefined && mongoFind._id != null){
            var mongodb = require('mongodb'); //usamos el modulo de mongo para poder crear un objeto de id
            var OID = new mongodb.ObjectID(mongoFind._id);
            mongoFind._id = OID;
        }
        collection.find(mongoFind).toArray(function (err, result) {
            if (!err) {
                res = true;
                msg = result;
                ret();
            } else {
                res = false;
                msg = err;
                ret();
            }
        });
    },

    //Crea una compra y la asigna al usuario indicado con el id
    dbCreateCompra: function (data, dbConection, cb){
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }
        var collection = dbConection.collection('compras');
        //realizamos el insert
        collection.insert(data, function (err, result){
        if (!err){
                cb({code:201, message:result.ops[0]});   //retornamos codigo de ok y el dato que debe venir en el arreglo de result.ops
            }
            else{
                //console.log('Sucedio un error ' + err);
                cb({code:500, message:err});
            }
        });
    },

    //obtiene el siguiente numero de una secuencia
    //se retorna mensaje al CB de la forma {code:true|false, message:numNextSequence}
    getNextSequence : function(colName, dbConection, cb){
        if(colName == undefined || colName == null){
            cb({code:false, message:'No se indico la secuencia por buscar'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:false, message:'Invalid DB connection'});
            return;
        }
        var collection = dbConection.collection('sequences');
        //indicamos los criterios de busqueda en un json
        var mongoFindJson = {_id: colName}; //id personalizada, no es por defecto la que define mongo object id
        //obtenemos los datos (y convertimos el cursor en array)
        collection.find(mongoFindJson).toArray(function (err, result) {
            if (!err) {
                var seqVal = 0;
                if(result.length > 0){
                    seqVal = result[0].sequence_value + 1;  //siguiente numero de la secuencia
                    cb({code:true, message:seqVal});
                }
                else{
                    //ingresamos la secuencia en BD
                    var cIns = function(isValid){
                        if(isValid){
                            cb({code:true, message:1});
                        }
                        else{
                            cb({code:false, message:'Ocurrio un error intentando definir la secuencia'});
                        }
                    };
                    var seqData = {_id: colName, sequence_value:0}; //id personalizada, no es por defecto la que define mongo object id
                    collection.insert(seqData, function (err, result){
                        if (!err){
                            cIns(true);   //retornamos codigo de ok y el dato que debe venir en el arreglo de result.ops
                        }
                        else{
                            //console.log('Sucedio un error ' + err);
                            cIns(false);
                        }
                    });
                }
            } else {
                cb({code:false, message:err});
            }
        });
    },

    //asigna el siguiente numero de una secuencia
    //se retorna mensaje al CB de la forma {code:true|false, message:numNextSequence}
    setSequence : function(colName, seqNumber, dbConection, cb){
        if(colName == undefined || colName == null){
            cb({code:false, message:'No se indico la secuencia por buscar'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:false, message:'Invalid DB connection'});
            return;
        }
        var collection = dbConection.collection('sequences');
        //indicamos los criterios de busqueda en un json
        var mongoFindJson = {_id: colName}; //id personalizada, no es por defecto la que define mongo object id
        var mongoUpdateJson = {sequence_value: seqNumber};

        collection.update(mongoFindJson, {$set: mongoUpdateJson}, {w:1}, function(err, res){
            if (err) {
                cb({code:false, message:err});
            }
            else if (res.result.ok > 0 && res.result.nModified > 0) {
                cb({code:true, message: res});
            }
            else if (res.result.ok > 0 && res.result.n > 0) {
                cb({code:true, message: 'El objeto intento ser seteado igual a su estado actual'});
            }
            else {
                cb({code:false, message: 'Sin datos que coincidan con ' + JSON.stringify(mongoFindJson)});
            }
        });
    },

    //actualiza los datos de una compra
    dbUpdateCompra: function (datosBusqueda, datosActualizar, dbConection, cb){
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }
        var collection = dbConection.collection('compras');
        collection.update(datosBusqueda, {$set: datosActualizar}, {w:1}, function(err, res){
            //console.log(JSON.stringify(res.result) + "\n\n" +JSON.stringify(res));
            if (err) {
                cb({code:500, message:err});
            }
            else if (res.result.ok > 0 && res.result.nModified > 0) {
                cb({code:200, message: datosActualizar}); //quizas sea mejor si se realiza un find pero de igual forma debe funcionar
            }
            //se intento modificar n documentos pero ningun campo habia sido manipulado
            else if (res.result.ok > 0 && res.result.n > 0) {
                cb({code:202, message: 'Ningun campo de la compra a sido modificada'});
            }
            else {
                cb({code:204, message: 'No se encontro ningun documento con el id indicado'});
            }
        });
    },

    //asociamos un analisis cereza a una compra, buiscada por su numero de remision
    setAnalisisCafeCereza: function (cRem, analisisData, dbConection, cb){
        if(analisisData == undefined || analisisData == null){
            cb({code:400, message:'Debe indicar el analisis por asignar'});
            return;
        }
        if(cRem == undefined || cRem == null){
            cb({code:400, message:'Compra con numero de remision nulo o indefinido'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }

        //indico los datos de actualizacion y los de busqueda
        var collection = dbConection.collection('compras');
        var mongoUpdateJson = {
            analisisCafeCereza: analisisData,  //obj
        };
        var mongoFind = {numeroRemision: parseInt(cRem)};

        collection.update(mongoFind, {$set: mongoUpdateJson}, {w:1}, function(err, res){
        //console.log(JSON.stringify(res.result) + "\n\n" +JSON.stringify(res));
            if (err) {
                cb({code:500, message:err});
            }
            else if (res.result.ok > 0 && res.result.nModified > 0) {
                cb({code:200, message: analisisData}); //quizas sea mejor si se realiza un find pero de igual forma debe funcionar
            }
            //se intento modificar n documentos pero ningun campo habia sido manipulado
            else if (res.result.ok > 0 && res.result.n > 0) {
                cb({code:202, message: 'Ningun campo de la compra a sido modificada'});
            }
            else {
                cb({code:204, message: 'No se encontro ningun documento con el id indicado'});
            }
        });
    },

    dbFindCompraByRemision: function(cRem, dbConection, cb){
        if(cRem == undefined || cRem == null){
            cb({code:400, message:'Compra con numero de remision nulo o indefinido'});
            return;
        }
        if(dbConection == undefined || dbConection == null){
            cb({code:500, message:'Invalid DB connection'});
            return;
        }

        var collection = dbConection.collection('compras');
        var mongoFind = {numeroRemision: parseInt(cRem)};
        collection.find(mongoFind).toArray(function (err, result) {
            if (!err) {
                cb({code:200, message:result[0]});
                //dbConection.close();
            } else {
                cb({code:500, message:err});
            }
        });
    },

    //retorna un arreglo con los datos encontrados
    getCompra: function(busquedaData, dbConection, cb){
        if(dbConection == undefined || dbConection == null){
            res = false;
            msg = -2;
            cb({respuesta: res, mensaje: msg});
            return msg;
        }
        var ret = function(){
            if(cb != undefined)
                cb({respuesta: res, mensaje: msg});
            return msg;
        };
        var collection = dbConection.collection('compras');
        var mongoFind = busquedaData;
        if(mongoFind == undefined || mongoFind == null || mongoFind == '')
            mongoFind = {};
        collection.find(mongoFind).toArray(function (err, result) {
            if (!err) {
                res = true;
                msg = result;
                ret();
            } else {
                res = false;
                msg = err;
                ret();
            }
        });
    },

    createLiquidacion: function (data, dbConection, cb){
        var ret = function(data){
            if(cb != undefined)
                cb(data);
            return res;
        };
        if(data == undefined || data == null || data._compra == undefined || data._compra == null){
            ret({respuesta: false, mensaje: -1});
            return false;
        }
        if(dbConection == undefined || dbConection == null){
            ret({respuesta: false, mensaje: -2});
            return false;
        }
        var collection = dbConection.collection('liquidaciones');
        //realizamos el insert
        collection.insert(data, function (err, result){
        if (!err){
                ret({respuesta:true, mensaje:result.ops[0]});   //retornamos codigo de ok y el dato que debe venir en el arreglo de result.ops
            }
            else{
                ret({respuesta:false, mensaje:err});
            }
        });
    }
}
