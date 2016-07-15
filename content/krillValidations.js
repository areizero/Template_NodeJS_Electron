/*Gestionando validacion*/
//validacion para insercion y busqueda de productor
//$('.productorDoc').bootstrapValidator({
$('#productorData').bootstrapValidator({
    message: 'This value is not valid',
    submitButtons: 'button[type="button"]',
    fields: {
        doc: {
            validators: {
                notEmpty: {
                    message: 'Debe ingresar el numero de documento.'
                }
            }
        },
        docTipo: {
            selector: '#ddPCType',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el tipo de documento.'
                }
            }
        }
   }
});

//validacion para compras
$('#compra').bootstrapValidator({
    message: 'This value is not valid',
    submitButtons: 'button[type="button"]',
    fields: {
        nombreLote: {
            selector: '#cargaNombreLote',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el nombre del Lote.'
                }
            }
        },
        cargaPeso: {
            selector: '#cargaPeso',
            validators: {
                numeric: {
                    message: 'Ingrese el peso en terminos de Kilogramos.'
                },
                notEmpty: {
                    message: 'Debe indicar el peso de la carga.'
                },
                regexp: {
                    regexp: /^(\d+\.?\d{0,2}|\.\d{1,9})$/ ,
                    message: 'Debe ser un numero positivo de dos decimales'
                }
            }
        },
        cargaDestare: {
            selector: '#cargaDestare',
            validators: {
                numeric: {
                    message: 'Ingrese el destare en terminos de Kilogramos.'
                },
                notEmpty: {
                    message: 'Debe indicar el destare de la carga.'
                },
                regexp: {
                    regexp: /^(\d+\.?\d{0,2}|\.\d{1,9})$/ ,
                    message: 'Debe ser un numero positivo de dos decimales'
                }
            }
        },
        tipoCafe: {
            selector: '#cargaTipoCafe',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el tipo de caf&eacute;.'
                }
            }
        },
        aspecto: {
            selector: '#cargaAspecto',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el aspecto del caf&eacute;.'
                }
            }
        },
        nBultos: {
            selector: '#cargaNBultos',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el numero de bultos.'
                },
                numeric: {
                    message: 'Debe ser un valor n&uacute;merico.'
                }
            }
        }
   }
});

//validacion para analisis cereza
$('#analisisCereza').bootstrapValidator({
    message: 'This value is not valid',
    submitButtons: 'button[type="button"]',
    live: 'enabled',
    fields: {
        pesoGramos: {
            selector: '.pesoGramo',
            validators: {
                notEmpty: {
                    message: 'Debe indicar el Peso.'
                },
                regexp: {
                    regexp: /^(\d+\.?\d{0,2}|\.\d{1,9})$/ ,
                    message: 'Debe ser un numero positivo de dos decimales'
                }
            }
        }
    }
});

$('#paramForm').bootstrapValidator({
    message: 'This value is not valid',
    submitButtons: 'button[type="button"]',
    fields: {
        parNum: {
            validators: {
                notEmpty: {
                    message: 'Indique un valor'
                },
                regexp: {
                    regexp: /^(\d+\.?\d{0,2}|\.\d{1,9})$/ ,
                    message: 'Debe ser un numero positivo de dos decimales'
                }
            }
        }
    }
});
