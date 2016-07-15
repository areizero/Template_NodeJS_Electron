var curUser;
var curCompra;
var cargasActuales = {};
var defaultParameters = {
    factorRendimiento: 96,
    valorServicioBeneficio: 4700,
    valorFlete: 0,
    valorCompra: 754000,
    valorCompraPasilla: 1000,
    factorCalculoAlmendra: 0.8,
    factorCalculoRendimiento: 70
};

init();
function init(){
    $(":input").val('');
    $("#compra :input" ).prop('disabled', true);
    $("#analisisCereza :input" ).prop('disabled', true);
    $("#paramForm :input" ).prop('disabled', true);
    $('#curUserName').hide();
    $("#btnActCarga").hide();
    $("#btnNewCarga").hide();
    $("#curCompra").hide();
    $("#btnRecCarga").show();
    $("#acumularCarga").hide();
    $("#btnDefPar").prop('disabled', true);
    $("#btnCurComPar").prop('disabled', true);
    $("#btnCurComPar").hide();
    $("#paramForm").removeClass("is-read-only");
    $("#paramForm").addClass("is-read-only");
    $.get("municipios.json", function (data, status, jqXHR){
        setMunicipios(JSON.parse(data));
    });
    $('#curUserName').hide();
    $('#curCompra').hide();
    $("#aModal").hide();
    curUser = undefined;
    curCompra = undefined;
    cargasActuales = {};
    $("#acumularCarga").hide();
    {
        $("#fRend").val(defaultParameters.factorRendimiento);
        $("#vServBen").val(defaultParameters.valorServicioBeneficio);
        $("#vFletes").val(defaultParameters.valorFlete);
        $("#vCompra").val(defaultParameters.valorCompra);
        $("#vCompraPas").val(defaultParameters.valorCompraPasilla);
        $("#fcalAlmendra").val(defaultParameters.factorCalculoAlmendra);
        $("#fcalRendimiento").val(defaultParameters.factorCalculoRendimiento);
    }
}
var setMunicipios = function(arr){
    for(i = 0; i < arr.length; i++){
        let option = '<option value="'+arr[i].codigomunicipio+'">'+arr[i].municipio+' - '+arr[i].departamento+'</option>'
        $("#ddPUbicacion").append(option);
    }
};
//definicion de los CB
var setProductor = function(dataProductor){
    //console.log("In the cb");
    curUser = dataProductor;
    $('#txtPName').val(dataProductor.nombre);
    $('#txtPDir').val(dataProductor.direccion);
    $('#ddPUbicacion').val(dataProductor.ubicacion);
    $('#btnProdReg').prop('disabled', true);
    $('#btnProdSearch').prop('disabled', true);
    $('#curUserName').html(dataProductor.nombre + ' (' + dataProductor.documentoTipo + ' ' + dataProductor.documentoNumero + ')');
    $('#curUserName').show();
    $("#compra :input" ).prop('disabled', false);
    //console.log('User _id ' + curUser._id);
    //$("#productorData").collapse('hide');    //ocultamos el form, para ahorrar espacio
    //$("#compra").collapse('show');
    curCompra = undefined;
    $('#curCompra').hide();
};
var setCompra = function(data){
    if($.isArray(data)){
       data = data[0];
    }
    curCompra = data;
    $('#curCompraRem').html("#"+data.numeroRemision);
    //asignamos valores autogenerados
    $('#cargaPesoNeto').val(data.pesoNeto);
    if(data.analisisCafeCereza != undefined){
        $('#acPesoHumedo').val(parseFloat(data.analisisCafeCereza.pesoTotalGranoHumedo).toFixed(2));
        $('#acConvC01').val(parseFloat(data.analisisCafeCereza.conversionCereza01).toFixed(2));
        $('#acConvC02').val(parseFloat(data.analisisCafeCereza.conversionCereza02).toFixed(2));
        $("#btnIndicrAnCC").prop('disabled', true);
        findLiquidacion();
    }
    //mostramos lo oculto
    $("#aModal").show();
    $("#curCompra").show();
    $("#btnActCarga").show();
    $("#btnNewCarga").show();
    $("#btnRecCarga").hide();
    if(curCompra.estado == "RECIBIDA"){
        $("#acumularCarga").show();}
    else{
        $("#acumularCarga").hide();}
    cargasActuales[curCompra.numeroRemision] = curCompra;
    //indicarCargasActuales();
    $("#liquidarCarga").prop( "disabled", false);
    $("#analisisCereza :input").prop('disabled', false);
};
$('#aModal').click(function(){
    mostrarCargas([curCompra], function(){});
});
var mostrarCargas = function(cargas, cb){
    //recorremos el arreglo de cargas actuales
    $('#modalCargasList').html('');
    for(var key in cargas){
        let carga = cargas[key];

        let anCC = '';
        let prod = '';
        let param = '';
        if(carga.analisisCafeCereza != undefined){
                anCC = '<div class="row">'+
                            '<div class="col-xs-9 col-xs-offset-1">'+
                                '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Anc">Analisis CC <span class="caret"></span></a>'+
                                '<div id="cargaShow'+carga.numeroRemision+'Anc" class="collapse">'+
                                    '<div class="row">'+
                                        '<div class="col-xs-8 col-xs-offset-1">Peso grano humedo: '+parseFloat(carga.analisisCafeCereza.pesoTotalGranoHumedo).toFixed(2)+'g</div>'+
                                    '</div>'+
                                    '<div class="row">'+
                                        '<div class="col-xs-8 col-xs-offset-1">Kg CC/@: '+parseFloat(carga.analisisCafeCereza.conversionCereza01).toFixed(2)+'g</div>'+
                                    '</div>'+
                                    '<div class="row">'+
                                        '<div class="col-xs-8 col-xs-offset-1">Kg CC/Kg: '+parseFloat(carga.analisisCafeCereza.conversionCereza02).toFixed(2)+'g</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
            };
        if(carga.productor != undefined){
            prod = '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Prod">Productor <span class="caret"></span></a>'+
                            '<div id="cargaShow'+carga.numeroRemision+'Prod" class="collapse">'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Nombre: '+carga.productor.nombre+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Documento: '+carga.productor.documentoTipo+' '+carga.productor.documentoNumero+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Direcci&oacute;n: '+carga.productor.direccion+'</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        }
        if(carga.parametros != undefined){
            param = '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Par">Parametros <span class="caret"></span></a>'+
                            '<div id="cargaShow'+carga.numeroRemision+'Par" class="collapse">'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">'+
                                        'Factor de rendimiento: '+carga.parametros.factorRendimiento+'<br/>'+
                                        'Valor servicio beneficio ($ x @CPS): '+carga.parametros.valorServicioBeneficio+'<br/>'+
                                        'Valor fletes ($ x kg CC): '+carga.parametros.valorFlete+'<br/>'+
                                        'Valor compra ($ x carga CPS): '+carga.parametros.valorCompra+'<br/>'+
                                        'Valor compra pasilla ($ x kg): '+carga.parametros.valorCompraPasilla+'<br/>'+
                                        'Factor calculo Almendra: '+carga.parametros.factorCalculoAlmendra+'<br/>'+
                                        'Factor calculo Rendimiento: '+carga.parametros.factorCalculoRendimiento+'<br/>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        };
        var li =
            '<li class="list-group-item list-group-item-info"><a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'"><b>Carga #'+carga.numeroRemision+' ('+carga.estado+') <span class="caret"></span></b></a>'+
                '<div id="cargaShow'+carga.numeroRemision+'" class="collapse">'+
                    '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                                'Nombre del lote: '+carga.lote+'<br/>'+
                                'Tipo de cafe: '+carga.tipoCafe+'<br/>'+
                                'Aspecto de cafe: '+carga.aspecto+'<br/>'+
                                'Estado: '+carga.estado+'<br/>'+
                                'Peso bruto: '+carga.pesoBruto+'KG<br/>'+
                                'Destare: '+carga.pesoDestare+'KG<br/>'+
                                'Peso Neto: '+carga.pesoNeto+'KG<br/>'+
                        '</div>'+
                    '</div>'+
                    anCC +
                    prod +
                    param +
                '</div>'+
            '</li>';
        $('#modalCargasList').append(li);
        if(cb != undefined){
            cb(li);
        }
    }
    //$('#modalCargas').modal();
};
$('#btnNewCarga').click(function(){
    curCompra = undefined;
    $("#compra .form-control").val("");
    $("#analisisCereza .form-control").val("");
    $("#liquidacionData .form-control").val("");
    $('#curCompra').hide();
    $("#btnActCarga").hide();
    $("#btnNewCarga").hide();
    $("#btnRecCarga").show();
    $("#aModal").hide();
    $('#compra').data('bootstrapValidator').resetForm();
    $('#paramForm').data('bootstrapValidator').resetForm();
    $('#analisisCereza').data('bootstrapValidator').resetForm();
    $("#analisisCereza :input" ).prop('disabled', true);
});
$('#btnDefPar').click(function(){
    let bootstrapValidator = $('#paramForm').data('bootstrapValidator');
    let valRes = bootstrapValidator.isValid();
    if(!valRes){
        bootstrapValidator.validate();
        valRes = bootstrapValidator.isValid();
        if(!valRes)
            return;
    }
    $("#paramForm").addClass("is-read-only");
    $("#paramForm :input" ).prop('disabled', true);
    let params = {
        factorRendimiento: $("#fRend").val(),
        valorServicioBeneficio: $("#vServBen").val(),
        valorFlete: $("#vFletes").val(),
        valorCompra: $("#vCompra").val(),
        valorCompraPasilla: $("#vCompraPas").val(),
        factorCalculoAlmendra: $("#fcalAlmendra").val(),
        factorCalculoRendimiento: $("#fcalRendimiento").val()
    };
    defaultParameters = params;
    //$('#paramForm').data('bootstrapValidator').resetForm();
});
attachProductorServices(setProductor);
attachCompraServices(setCompra);
var showLiquidacion = function(data){
    $("#liqFactRendCor").val(parseFloat(data.factorRendimientoCorregido).toFixed(2));
    $("#liqKilRealPer").val(parseFloat(data.kilosRealesPergamino).toFixed(2));
    $("#liqKilPasilla").val(parseFloat(data.kilosPasilla).toFixed(2));
    $("#liqValRealCer").val(parseFloat(data.valorRealCereza).toFixed(2));
    $("#liqDescSB").val(parseFloat(data.descuentoServicioBeneficio).toFixed(2));
    $("#liqDescFlet").val(parseFloat(data.descuentoFletes).toFixed(2));
    $("#liqValPas").val(parseFloat(data.valorPasilla).toFixed(2));
    $("#liqValCarga").val(parseFloat(data.valorCarga).toFixed(2));
    $("#liqValNeto").val(parseFloat(data.valorNeto).toFixed(2));
    //$("#liquidacionData").collapse("show");
};


//exponemos los servicios e indicamos que al final se haga el cb indicado


//Productor, habilitar botones segun el caso
var verProdBot = function(){
    if(curUser == undefined)
        return;
    //console.log("Gestionando ahora a " + curUser.documentoNumero + ' - ' + curUser.documentoTipo);
    if($('#txtPCNumber').val() == curUser.documentoNumero && $('#ddPCType').val() == curUser.documentoTipo){
        $('#btnProdReg').prop('disabled', true);
        $('#btnProdSearch').prop('disabled', true);
        return;
    }
    //si llegamos aqui es por que algun dato no coincide con el usuario que estamos gestionando
    $('#btnProdReg').prop('disabled', false);
    $('#btnProdSearch').prop('disabled', false);
}

$('#txtPCNumber').change(function(){
    verProdBot();
});
$('#ddPCType').change(function(){
    verProdBot();
});

//calculos automaticos para compra
var calValoresCompra = function(){
    let peso = parseFloat($("#cargaPeso").val());
    let destare = parseFloat($("#cargaDestare").val());
    if(isNaN(peso) || isNaN(destare)){
        $("#cargPesoNeto").val('');
        return;
    }
    $("#cargaPesoNeto").val((peso - destare).toFixed(2));
}
$('#cargaPeso').keyup(function(){
    calValoresCompra();
});
$('#cargaDestare').keyup(function(){
    calValoresCompra();
});

//calculos automaticos para cafe cereza
var calValoresCereza = function(){
    const constantes = {tasaConvCereza1: 2*12.5, tasaConvCereza2: 1/12.5};
    let pesoMuestra = parseFloat($("#acPesoMuestra").val());
    let pesoBroca = parseFloat($("#acPesoBroca").val());
    let pesoEscurrido = parseFloat($("#acPesoGranoEs").val());
    let pesoPasilla = parseFloat($("#acPesoPasillas").val());
    let conversion01 = '';
    let conversion02 = '';
    let humedo = '';
    if(!isNaN(pesoMuestra) && !isNaN(pesoEscurrido)){
        conversion01 = ((constantes['tasaConvCereza1']*pesoMuestra)/pesoEscurrido).toFixed(2);
        conversion02 = (conversion01*constantes['tasaConvCereza2']).toFixed(2);
        if(!isNaN(pesoPasilla) && !isNaN(pesoBroca))
            humedo = (pesoBroca + pesoPasilla + pesoEscurrido).toFixed(2);
    }
    let pesoFlot1 = parseFloat($("#acPesoFlot1").val());
    let pesoFlot2 = parseFloat($("#acPesoFlot2").val());
    $("#acConvC01").val(conversion01);
    $("#acConvC02").val(conversion02);
    $("#acPesoHumedo").val(humedo);
    if(curCompra != undefined && curCompra.analisisCafeCereza != undefined){
        if(pesoMuestra != curCompra.analisisCafeCereza.pesoMuestraCereza || pesoBroca != curCompra.analisisCafeCereza.pesoBroca || pesoEscurrido != curCompra.analisisCafeCereza.pesoGranoEscurrido || pesoPasilla != curCompra.analisisCafeCereza.pesoPasillas || pesoFlot1 != curCompra.analisisCafeCereza.pesoFlotes1 || pesoFlot2 != curCompra.analisisCafeCereza.pesoFlotes2){
            $("#btnIndicrAnCC").prop('disabled', false);
        }
        else{
            $("#btnIndicrAnCC").prop('disabled', true);
        }
    }

}
$('#acPesoMuestra').keyup(function(){
    calValoresCereza();
});
$('#acPesoFlot1').keyup(function(){
    calValoresCereza();
});
$('#acPesoFlot2').keyup(function(){
    calValoresCereza();
});
$('#acPesoBroca').keyup(function(){
    calValoresCereza();
});
$('#acPesoPasillas').keyup(function(){
    calValoresCereza();
});
$('#acPesoGranoEs').keyup(function(){
    calValoresCereza();
});

//indicar las carga actuales par el pago
var indicarCargasActuales = function(){
    //recorremos el arreglo de cargas actuales
    $('#modalPagoList').html('');
    for(var key in cargasActuales){
        let carga = cargasActuales[key];
        var anCC = '';
        if(carga.analisisCafeCereza != undefined){
            anCC = '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b><a href="#" data-toggle="collapse" data-target="#carga'+carga.numeroRemision+'Anc">Analisis CC</a></b>'+
                            '<div id="carga'+carga.numeroRemision+'Anc" class="collapse">'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Peso grano humedo: '+parseFloat(carga.analisisCafeCereza.pesoTotalGranoHumedo).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/@: '+parseFloat(carga.analisisCafeCereza.conversionCereza01).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/Kg: '+parseFloat(carga.analisisCafeCereza.conversionCereza02).toFixed(2)+'g</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        };
        var li =
            '<li class="list-group-item list-group-item-info"><a href="#" data-toggle="collapse" data-target="#carga'+carga.numeroRemision+'"><b>Carga #'+carga.numeroRemision+' ('+carga.estado+')</b></a>'+
                '<div id="carga'+carga.numeroRemision+'" class="collapse">'+
                    '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b>Peso Neto:</b> '+carga.pesoNeto+'KG<br/>'+
                        '</div>'+
                    '</div>'+
                    anCC
                '</div>'+
            '</li>';
        $('#modalPagoList').append(li);
    }
};

//indicar las carga actuales par el pago
var showCargasUsuario = function(cargas, cb){
    //recorremos el arreglo de cargas actuales
    $('#cargasModalList').html('');
    for(var key in cargas){
        let carga = cargas[key];
        var anCC = '';
        if(carga.analisisCafeCereza != undefined){
            anCC = '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b><a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Anc">Analisis CC <span class="caret"></span></a></b>'+
                            '<div id="cargaShow'+carga.numeroRemision+'Anc" class="collapse">'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Peso grano humedo: '+parseFloat(carga.analisisCafeCereza.pesoTotalGranoHumedo).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/@: '+parseFloat(carga.analisisCafeCereza.conversionCereza01).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/Kg: '+parseFloat(carga.analisisCafeCereza.conversionCereza02).toFixed(2)+'g</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        };
        var li =
            '<li class="list-group-item list-group-item-info"><a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'"><b>Carga #'+carga.numeroRemision+' ('+carga.estado+') <span class="caret"></span></b></a>'+
                '<div id="cargaShow'+carga.numeroRemision+'" class="collapse">'+
                    '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b>Nombre del lote:</b> '+carga.lote+'<br/>'+
                        '</div>'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b>Tipo de cafe:</b> '+carga.tipoCafe+'<br/>'+
                        '</div>'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b>Aspecto de cafe:</b> '+carga.aspecto+'<br/>'+
                        '</div>'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<b>Peso Neto:</b> '+carga.pesoNeto+'KG<br/>'+
                        '</div>'+
                    '</div>'+
                    anCC
                '</div>'+
            '</li>';
        $('#cargasModalList').append(li);
    }
    $('#cargasModal').modal();
};

var setCargaFind = function(carga){
    let anCC = '';
    let prod = '';
    let param = '';
    if(carga.analisisCafeCereza != undefined){
            anCC = '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Anc">Analisis CC <span class="caret"></span></a>'+
                            '<div id="cargaShow'+carga.numeroRemision+'Anc" class="collapse">'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Peso grano humedo: '+parseFloat(carga.analisisCafeCereza.pesoTotalGranoHumedo).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/@: '+parseFloat(carga.analisisCafeCereza.conversionCereza01).toFixed(2)+'g</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-xs-8 col-xs-offset-1">Kg CC/Kg: '+parseFloat(carga.analisisCafeCereza.conversionCereza02).toFixed(2)+'g</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        };
    if(carga.productor != undefined){
        prod = '<div class="row">'+
                    '<div class="col-xs-9 col-xs-offset-1">'+
                        '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Prod">Productor <span class="caret"></span></a>'+
                        '<div id="cargaShow'+carga.numeroRemision+'Prod" class="collapse">'+
                            '<div class="row">'+
                                '<div class="col-xs-8 col-xs-offset-1">Nombre: '+carga.productor.nombre+'</div>'+
                            '</div>'+
                            '<div class="row">'+
                                '<div class="col-xs-8 col-xs-offset-1">Documento: '+carga.productor.documentoTipo+' '+carga.productor.documentoNumero+'</div>'+
                            '</div>'+
                            '<div class="row">'+
                                '<div class="col-xs-8 col-xs-offset-1">Direcci&oacute;n: '+carga.productor.direccion+'</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    }
    if(carga.parametros != undefined){
        param = '<div class="row">'+
                    '<div class="col-xs-9 col-xs-offset-1">'+
                        '<a href="#" data-toggle="collapse" data-target="#cargaShow'+carga.numeroRemision+'Par">Parametros <span class="caret"></span></a>'+
                        '<div id="cargaShow'+carga.numeroRemision+'Par" class="collapse">'+
                            '<div class="row">'+
                                '<div class="col-xs-8 col-xs-offset-1">'+
                                    'Factor de rendimiento: '+carga.parametros.factorRendimiento+'<br/>'+
                                    'Valor servicio beneficio ($ x @CPS): '+carga.parametros.valorServicioBeneficio+'<br/>'+
                                    'Valor fletes ($ x kg CC): '+carga.parametros.valorFlete+'<br/>'+
                                    'Valor compra ($ x carga CPS): '+carga.parametros.valorCompra+'<br/>'+
                                    'Valor compra pasilla ($ x kg): '+carga.parametros.valorCompraPasilla+'<br/>'+
                                    'Factor calculo Almendra: '+carga.parametros.factorCalculoAlmendra+'<br/>'+
                                    'Factor calculo Rendimiento: '+carga.parametros.factorCalculoRendimiento+'<br/>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    };
    let inHtml =
            '<li class="list-group-item list-group-item-info"><b>Carga #'+carga.numeroRemision+' ('+carga.estado+')</b>'+
                '<div id="cargaShow'+carga.numeroRemision+'">'+
                    '<div class="row">'+
                        '<div class="col-xs-9 col-xs-offset-1">'+
                            'Nombre del lote: '+carga.lote+'<br/>'+
                            'Tipo de cafe: '+carga.tipoCafe+'<br/>'+
                            'Aspecto de cafe: '+carga.aspecto+'<br/>'+
                            'Estado: '+carga.estado+'<br/>'+
                            'Peso bruto: '+carga.pesoBruto+'KG<br/>'+
                            'Destare: '+carga.pesoDestare+'KG<br/>'+
                            'Peso Neto: '+carga.pesoNeto+'KG<br/>'+
                        '</div>'+
                    '</div>'+
                    anCC +
                    prod +
                    param +
                '</div>'+
            '</li>';
    $("#cargaFindDescripcion").html(inHtml);
};

//indicar parametros
$('#compraPar').click(function(){
    $("#paramForm").removeClass("is-read-only");
    $("#paramForm :input").prop('disabled', false);
    $("#btnDefPar").prop('disabled', false);
    $("#btnCurComPar").prop('disabled', true);
    $("#btnCurComPar").hide();
    if(curCompra != undefined){
        $("#btnCurComPar").prop('disabled', false);
        $("#btnCurComPar").show();
        let parametros = curCompra.parametros;
        $("#fRend").val(parametros.factorRendimiento);
        $("#vServBen").val(parametros.valorServicioBeneficio);
        $("#vFletes").val(parametros.valorFlete);
        $("#vCompra").val(parametros.valorCompra);
        $("#vCompraPas").val(parametros.valorCompraPasilla);
        $("#fcalAlmendra").val(parametros.factorCalculoAlmendra);
        $("#fcalRendimiento").val(parametros.factorCalculoRendimiento);
    }
    else{
        $("#fRend").val(defaultParameters.factorRendimiento);
        $("#vServBen").val(defaultParameters.valorServicioBeneficio);
        $("#vFletes").val(defaultParameters.valorFlete);
        $("#vCompra").val(defaultParameters.valorCompra);
        $("#vCompraPas").val(defaultParameters.valorCompraPasilla);
        $("#fcalAlmendra").val(defaultParameters.factorCalculoAlmendra);
        $("#fcalRendimiento").val(defaultParameters.factorCalculoRendimiento);
    }
});

//limpiar datos actuales
$('#clear').click(function(){
    //$(".collapse").collapse('hide');
    $("#clearModal").modal("toggle");
    init();
});


/*JS de Bootstrap*/
$('[data-toggle="tooltip"]').tooltip(); //para mostrar los tooltip de Bootstrap
$('[data-toggle="modal"]').tooltip(); //para mostrar los tooltip de Bootstrap
