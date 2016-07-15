//indicamos las acciones pertinentes a llamados de servicios segun las acciones en el front
var showCompleteMessage = function(tit, msg){
    $.notify({title: '<strong>'+tit+': </strong>', message: msg},
             {type: "success", allow_dismiss: true, mouse_over: 'pause'});
}
var showNotCompleteMessage = function(tit, msg){
    $.notify({title: '<strong>'+tit+': </strong>', message: msg});
}
var showValidationMessage = function(tit, msg){
    $.notify({title: '<strong>'+tit+': </strong>', message: msg},
             {type: "warning", allow_dismiss: true, mouse_over: 'pause'});
}
var showErrorMessage = function(tit, msg){
    $.notify({title: '<strong>'+tit+': </strong>', message: msg},
             {type: "danger", allow_dismiss: true, mouse_over: 'pause', animate: {enter: 'animated zoomInDown',exit: 'animated zoomOutUp'}});
}

//especificamos que elementos invocaran los servicios de gestionn de productores
function attachProductorServices(cb){
    //para creacion de productores
    $('#btnProdReg').click(function(){
        //validamos mediante bootstrapValidator
        var bootstrapValidator = $('#productorData').data('bootstrapValidator');
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            return;
        }
        //creamos el objeto que enviaremos como data en el Post, Productor
        productorObject = {
            pCNumber: $('#txtPCNumber').val(),
            pCType: $('#ddPCType').val(),
            pName: $('#txtPName').val(),
            pDir: $('#txtPDir').val(),
            pUbicacion: $('#ddPUbicacion').val()
        };
        //realizamos el llamado al api post
        $.post('http://localhost:8888/api/productores', productorObject, function (data, status, jqXHR) {
            //console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status + "\njqXHR " + JSON.stringify(jqXHR));
            //validamos mediante bootstrapValidator
            let statusCode = jqXHR.status;
            if (statusCode == 204) {
                showNotCompleteMessage('Registro', 'El usuario ya esta registrado.');
            }
            if (statusCode == 200) {
                showNotCompleteMessage('Registro', 'El usuario ya esta registrado.');
                cb(data);
                return;
            }
            if (data != undefined) {
                showCompleteMessage('Registro', 'Se ha registrado el productor ' + data.nombre + ' ' + '.');
                cb(data);
            }
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Registro', 'No fue posible registrar el productor.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });
    });

    //para busqueda de productor
    $('#btnProdSearch').click(function(){
        //validamos mediante bootstrapValidator
        var bootstrapValidator = $('#productorData').data('bootstrapValidator');
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            return;
        }
        let doc = $('#txtPCNumber').val();
        let type = $('#ddPCType').val();
        let dataBody = {
            docNumber: doc,
            docType: type
        };
        //$.get('http://localhost:8888/api/productores?docNumber='+doc+'&docType='+type+'', function(data, status, jqXHR){
        $.get('http://localhost:8888/api/productores', dataBody, function(data, status, jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 204){
                showNotCompleteMessage('Busqueda', 'No se hall&oacute; el productor buscado.');
            }
            if(data != undefined){
                //showCompleteMessage('Busqueda', 'Se ha encontrado el productor ' + data.nombre + '.');
                cb(data);
            }
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Busqueda', 'No se hall&oacute; el productor buscado.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
        });
    });

    //para actualizar productor
    $('#btnProdUpd').click(function(){
        //validamos mediante bootstrapValidator
        var bootstrapValidator = $('#productorData').data('bootstrapValidator');
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            return;
        }
        let user = curUser;
        //console.log(JSON.stringify(user));
        if(user == undefined || user == null || user._id == undefined || user._id == null){
            showValidationMessage('Actualizaci&oacute;n', 'Actualmente no se encuentra gestionando ningun productor.<br/><br/>Por favor realice la busqueda o el registro del productor que desea gestionar.');
            return;
        }
         //creamos el objeto que enviaremos como data
        let productorObject = {
            //docNumero: $('#txtPCNumber').val(),
            //docTipo: $('#ddPCType').val(),
            docNumero: user.documentoNumero,
            docTipo: user.documentoTipo,
            nombre: $('#txtPName').val(),
            direccion: $('#txtPDir').val(),
            ubicacion: $('#ddPUbicacion').val()
        };

        //llamamos el servicio
        $.ajax({
            url: "http://localhost:8888/api/productores/" + user._id,
            type: "PUT",
            data: productorObject,
            success: function (data, textStatus, jqXHR) {
                //console.dir(data); console.log(textStatus); console.dir(jqXHR);
                let statusCode = jqXHR.status;
                if(statusCode == 204) {
                    showNotCompleteMessage('Actualizaci&oacute;n', 'No pudo realizarse la actualizaci&oacute;n, hubo algun problema interno con el id del productor.');
                    return;
                }
                if(statusCode == 200 && data != undefined) {
                    showCompleteMessage('Actualizaci&oacute;n', 'Se ha actualizado el productor ' + data.nombre + ' ' + '.');
                    cb(data);
                    return;
                }

                showNotCompleteMessage('Actualizaci&oacute;n ('+jqXHR.status+')', data);
            }
        }).fail(function(data, status, jqXHR){
                showNotCompleteMessage('Actualizaci&oacute;n', 'No se actualizo el productor buscado.');
                showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });;
    });
}

//especificamos que elementos invocaran los servicios de gestionn de productores
function attachCompraServices(cb){
    $('#btnRecCarga').click(function(){
        //console.log("Se registrara la compra");
        //validamos mediante bootstrapValidator
        calValoresCompra();
        var bootstrapValidator = $('#compra').data('bootstrapValidator');
        //bootstrapValidator.validate();
        let valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            valRes = bootstrapValidator.isValid();
            if(!valRes)
                return;
        }
        //console.log("Creando objeto para post");
        dataObject = {
            lote: $("#cargaNombreLote").val(),
            pesoBruto: $("#cargaPeso").val(),
            numBultos: $("#cargaNBultos").val(),
            pesoDestare: $("#cargaDestare").val(),
            pesoNeto: $("#cargaPesoNeto").val(),
            tipoCafe: $("#cargaTipoCafe").val(),
            aspecto: $("#cargaAspecto").val(),
            parametros: defaultParameters
        };
        let user = curUser;
        if(user == undefined){
            showNotCompleteMessage('Registro de compra', 'Debe estar gestionando algun Productor, haga la busqueda o insercion del Productor para el que gestiona la compra');
            return;
        }
        //realizamos el llamado al api post
        //console.log("Realizando Post Ajax");
        $.post("http://localhost:8888/api/productores/"+user._id+"/compras", dataObject, function (data, status, jqXHR) {
            //console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status + "\njqXHR " + JSON.stringify(jqXHR));
            //validamos mediante bootstrapValidator
            let statusCode = jqXHR.status;
            if (data != undefined) {
                showCompleteMessage('Registro de compra', 'La compra fue registrada con numero de remision '+data.numeroRemision);
                $("#acPesoMuestra").val('1000');
                cb(data);
            }
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Registro de compra', 'No fue posible registrar la compra');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });
    });

    $('#btnActCarga').click(function(){
        //console.log("Se registrara la compra");
        //validamos mediante bootstrapValidator
        calValoresCompra();
        var bootstrapValidator = $('#compra').data('bootstrapValidator');
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            return;
        }
        //creamos el objeto que enviaremos como data en el Post, Productor
        //console.log("Creando objeto para post");
        dataObject = {
            lote: $("#cargaNombreLote").val(),
            pesoBruto: $("#cargaPeso").val(),
            pesoDestare: $("#cargaDestare").val(),
            pesoNeto: $("#cargaPesoNeto").val(),
            tipoCafe: $("#cargaTipoCafe").val(),
            numBultos: $("#cargaNBultos").val(),
            aspecto: $("#cargaAspecto").val()
        };
        let user = curUser;
        if(user == undefined){
            return;
        }
        if(curCompra == undefined)
            return;

        $.ajax({
            url: "http://localhost:8888/api/productores/"+user._id+"/compras/"+curCompra.numeroRemision,
            type: "PUT",
            data: dataObject,
            success: function (data, textStatus, jqXHR) {
                //console.dir(data); console.log(textStatus); console.dir(jqXHR);
                let statusCode = jqXHR.status;
                if(statusCode == 204) {
                    return;
                }
                if(statusCode == 200 && data != undefined) {
                    showCompleteMessage('Actualizaci&oacute;n', 'Compra '+data.numeroRemision + ' actualizada');
                    cb(data);
                    return;
                }
            }
        }).fail(function(data, status, jqXHR){
                showNotCompleteMessage('Actualizaci&oacute;n', 'No se actualizaron los datos de la compra.');
                showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });;
    });

    $('#acumularCarga').click(function(){
        //console.log("Se registrara la compra");
        //validamos mediante bootstrapValidator
        calValoresCompra();
        var bootstrapValidator = $('#compra').data('bootstrapValidator');
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            return;
        }
        //creamos el objeto que enviaremos como data en el Post, Productor
        //console.log("Creando objeto para post");
        dataObject = {
            estado: 'ACUMULADA'
        };
        let user = curUser;
        if(user == undefined){
            return;
        }
        if(curCompra == undefined)
            return;

        $.ajax({
            url: "http://localhost:8888/api/productores/"+user._id+"/compras/"+curCompra.numeroRemision,
            type: "PUT",
            data: dataObject,
            success: function (data, textStatus, jqXHR) {
                //console.dir(data); console.log(textStatus); console.dir(jqXHR);
                let statusCode = jqXHR.status;
                if(statusCode == 204) {
                    return;
                }
                if(statusCode == 200 && data != undefined) {
                    showCompleteMessage('', 'Compra '+data.numeroRemision + ' acumulada');
                    cb(data);
                    return;
                }
            }
        }).fail(function(data, status, jqXHR){
                showNotCompleteMessage('', 'No fue posible acumular la compra');
                showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });;
    });

    $('#btnIndicrAnCC').click(function(){
        //validamos mediante bootstrapValidator
        var bootstrapValidator = $('#analisisCereza').data('bootstrapValidator');
        //bootstrapValidator.validate();
        var valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            valRes = bootstrapValidator.isValid();
            if(!valRes)
                return;
        }

        let user = curUser;
        let anCC = {
            pesoMuestraCereza: $('#acPesoMuestra').val(),
            pesoBroca: $('#acPesoBroca').val(),
            pesoFlotes1: $('#acPesoFlot1').val(),
            pesoFlotes2: $('#acPesoFlot2').val(),
            pesoPasillas: $('#acPesoPasillas').val(),
            pesoGranoEscurrido: $('#acPesoGranoEs').val()
        };
        let auxCompra = curCompra;
        //auxCompra.analisisCafeCereza = anCC;
        $.post("http://localhost:8888/api/productores/"+user._id+"/compras/"+auxCompra.numeroRemision+"/analisis", anCC, function (data, status, jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 204) {
                showNotCompleteMessage('Analisis Cafe cereza', 'No pudo realizarse el analisis cafe cereza, error de identificaci&oacute;n interno.');
                return;
            }
            if(statusCode == 200 && data != undefined) {
                showCompleteMessage('Analisis Cafe cereza', 'Se indico el analisis cafe cereza para la carga actual.');
                cb(data);
                return;
            }
            showNotCompleteMessage('Actualizaci&oacute;n ('+jqXHR.status+')', data);
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Analisis Cafe cereza', 'No pudo realizarse el analisis cafe cereza.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
        });
    });

    $('#showRecibidas').click(function(){
        let user = curUser;
        let dataFind = {estado: "RECIBIDA"};
        $.get("http://localhost:8888/api/productores/"+user._id+"/compras", dataFind, function(data, status, jqXHR){
            var status = jqXHR.status;
            if(status == 200){
                $("#cargasModalTit").html("Cargas Recibidas");
                console.log(data);
                showCargasUsuario(data);
                return;
            }
            showNotCompleteMessage('Cargas Recibidas', 'No se hallaron cargas recibidas para '+curUser.nombre+'.');
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Cargas Recibidas', 'No se hallaron cargas recibidas para '+curUser.nombre+'.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
        });
    });

    $('#showPendientes').click(function(){
        let user = curUser;
        let dataFind = {estado: "ACUMULADA"};
        $.get("http://localhost:8888/api/productores/"+user._id+"/compras", dataFind, function(data, status, jqXHR){
            var status = jqXHR.status;
            if(status == 200){
                $("#cargasModalTit").html("Cargas Pendientes");
                showCargasUsuario(data);
                return;
            }
            showNotCompleteMessage('Cargas Pendientes', 'No se hallaron cargas pendientes para '+curUser.nombre+'.');
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Cargas Pendientes', 'No se hallaron cargas pendientes para '+curUser.nombre+'.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
        });
    });

    $('#showLiquidadas').click(function(){
        let user = curUser;
        let dataFind = {estado: "LIQUIDADA"};
        $.get("http://localhost:8888/api/productores/"+user._id+"/compras", dataFind, function(data, status, jqXHR){
            var status = jqXHR.status;
            if(status == 200){
                $("#cargasModalTit").html("Cargas Liquidadas");
                showCargasUsuario(data);
                return;
            }
            showNotCompleteMessage('Cargas Liquidadas', 'No se hallaron cargas liquidadas para '+curUser.nombre+'.');
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Cargas Liquidadas', 'No se hallaron cargas liquidadas para '+curUser.nombre+'.');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
        });
    });

    $('#findCarga').click(function(){
        let nrem = $("#findNRemision").val();
        let dataFind = {numeroRemision: parseInt(nrem)};
        $.get("http://localhost:8888/api/compras", dataFind, function(data, status, jqXHR){
            var status = jqXHR.status;
            if(status == 200){
                let cFind = data[0];
                //console.log(cFind);
                setCargaFind(cFind);
                return;
            }
            $("#cargaFindDescripcion").html("No fue hallada la carga con numero de remision " + nrem);
        }).fail(function(data, status, jqXHR){
            $("#cargaFindDescripcion").html("No fue hallada la carga con numero de remision " + nrem + " "+jqXHR+ ' (' + data.status + '): '+ data.responseText);
        });
    });

    $('#btnCurComPar').click(function(){
        let bootstrapValidator = $('#paramForm').data('bootstrapValidator');
        //bootstrapValidator.validate();
        let valRes = bootstrapValidator.isValid();
        if(!valRes){
            bootstrapValidator.validate();
            valRes = bootstrapValidator.isValid();
            if(!valRes)
                return;
        }
        let params = {
            factorRendimiento: $("#fRend").val(),
            valorServicioBeneficio: $("#vServBen").val(),
            valorFlete: $("#vFletes").val(),
            valorCompra: $("#vCompra").val(),
            valorCompraPasilla: $("#vCompraPas").val(),
            factorCalculoAlmendra: $("#fcalAlmendra").val(),
            factorCalculoRendimiento: $("#fcalRendimiento").val()
        };
        let dataObject = {
            parametros: params
        };

        $.ajax({
            url: "http://localhost:8888/api/productores/"+curUser._id+"/compras/"+curCompra.numeroRemision,
            type: "PUT",
            data: dataObject,
            success: function (data, textStatus, jqXHR) {
                //console.dir(data); console.log(textStatus); console.dir(jqXHR);
                $("#paramForm").addClass("is-read-only");
                $("#paramForm :input" ).prop('disabled', true);
                let statusCode = jqXHR.status;
                if(statusCode == 204) {
                    return;
                }
                if(statusCode == 200 && data != undefined) {
                    showCompleteMessage('Parametros de compra:', 'Compra '+data.numeroRemision + ' actualizada');
                    cb(data);
                    return;
                }
            }
        }).fail(function(data, status, jqXHR){
                showNotCompleteMessage('Parametros de compra', 'No se actualizaron los datos de la compra.');
                showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });;
    });

    $('#liquidarCarga').click(function(){
        let user = curUser;
        if(user == undefined){
            showNotCompleteMessage('Registro de compra', 'Debe estar gestionando algun Productor, haga la busqueda o insercion del Productor para el que gestiona la compra');
            return;
        }
        $.post("http://localhost:8888/api/productores/"+curUser._id+"/compras/"+curCompra.numeroRemision+"/liquidacion", dataObject, function (data, status, jqXHR) {
            let statusCode = jqXHR.status;
            if(statusCode == 200){
                showLiquidacion(data);
                showCompleteMessage('Liquidaci&oacute;n', 'La compra '+data._compra+' fue liquidada');
                $("#liquidarCarga").prop( "disabled", true );
            }
        }).fail(function(data, status, jqXHR){
            showNotCompleteMessage('Liquidaci&oacute;n', 'La compra '+curCompra.numeroRemision+' NO pudo ser liquidada');
            showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
            });
    });
}

var findLiquidacion = function(){
    $.get("http://localhost:8888/api/productores/"+curUser._id+"/compras/"+curCompra.numeroRemision+"/liquidacion", function(data, status, jqXHR){
        var status = jqXHR.status;
        if(status == 200){
            showLiquidacion(data);
        }
    }).fail(function(data, status, jqXHR){
        showNotCompleteMessage('Liquidaci&oacute;n', 'No puede mostrarse la liquidaci&oacute;n.');
        showErrorMessage(jqXHR+ ' (' + data.status + ') ', data.responseText);
    });
}
