function Person(name, idCard){  //object constructor    
    this.name = name;
    this.identityCardNumber = idCard;
    this.mail = "";    
    this.address = "";
    this.telephone = "";    
}

Compra.prototype.setData = function(data){
    if(data.name != undefined)
        this.name = data.name;
    if(data.identityCardNumber != undefined)
        this.identityCardNumber = data.identityCardNumber;
    if(data.mail != undefined)
        this.mail = data.mail;    
    if(data.address != undefined)
        this.address = data.name;
    if(data.phone != undefined)        
        this.phone = data.phone;
}

module.exports = Person;    //  Export object like NodeJS Module
