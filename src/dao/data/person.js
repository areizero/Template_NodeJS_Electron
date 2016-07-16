function Person(name, idCard){  //object constructor    
    this.name = name;
    this.identityCardNumber = idCard;
    this.email = "";
    this.address = "";
    this.telephone = "";    
}

Person.prototype.setData = function(data){
    if(data.name != undefined)
        this.name = data.name;
    if(data.identityCardNumber != undefined)
        this.identityCardNumber = data.identityCardNumber;
    if(data.email != undefined)
        this.email = data.mail;
    if(data.address != undefined)
        this.address = data.name;
    if(data.phone != undefined)        
        this.phone = data.phone;
}

module.exports = Person;    //  Export object like NodeJS Module
