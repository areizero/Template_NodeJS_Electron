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
        this.email = data.email;
    if(data.address != undefined)
        this.address = data.address;
    if(data.telephone != undefined)
        this.telephone = data.telephone;
    if(data.test == true)
        this.test = true;
}

module.exports = Person;    //  Export object like NodeJS Module
