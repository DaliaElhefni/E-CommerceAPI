const bcrypt = require('bcrypt');
const userModel = require('../models/user');



function hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (error, salt) => {
        if (error) 
        {
            return reject(error);
        }
        else{  
        bcrypt.hash(password,salt,(error, hash) => error ? reject(error) : resolve(hash));
        }
      }); 
    
    });
  }

function comparePassword(bodyPassword , dbPassword){
console.log(bodyPassword,dbPassword)
  return new Promise((resolve,reject)=>{
    bcrypt.compare(bodyPassword, dbPassword, function(err, isMatch) {
      if (err) {
        reject(err);
      } else if (!isMatch) {
        console.log("hello")
        reject("Password doesn't match!")
      } else {
        console.log("hola")

        resolve()
      }
  })

  })


}

function checkAdminExists(admin){
  return new Promise((resolve,reject)=>{
    userModel.findOne({"role":admin},function(error,exists){
      if(error || !exists){
        reject(error)
      }else if(exists){
        resolve(exists)
      }
    })
  })
}

function updateDB(id,body){
  console.log(body)
  return new Promise((resolve,reject)=>{
     userModel.findByIdAndUpdate(id,body,function(err,result){
      if(err)
      {
        console.log("promise error")
        reject(err)
      }
      else
      {       
           resolve(result)    
      }
  })   
  })
}


module.exports = {  
  hashPassword : hashPassword,
  comparePassword : comparePassword,
  checkAdminExists : checkAdminExists,
  updateDB : updateDB
};