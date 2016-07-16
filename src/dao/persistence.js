//  export in nodeJS like functions, not for objects export
module.exports = {
    //  also we can use exports.createPerson
    createPerson: function (dataObject, dbConection, cb){
        var ret = function(data){
            if(cb != undefined)
                cb(data);
            return data.res;
        };
        if(dataObject == undefined || dataObject == null){
            ret({res: false, msg: 'The object is NUll', err: -2});
            return false;
        }
        if(dbConection == undefined || dbConection == null){
            ret({res: false, msg: "The DBConnection isn't valid", err: -3});
            return false;
        }
        var collection = dbConection.collection('liquidaciones');
        //  insert with connection of mongo-db
        collection.insert(dataObject, function (err, result){
        if (!err){
                ret({res:true, msg:result.ops[0]});   //  return object inserted of result.ops
            }
            else{
                ret({res: false, msg: err, err: -1});
                ret({respuesta:false, mensaje:err});
            }
        });
    }
}
