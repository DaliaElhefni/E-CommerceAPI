const bcrypt = require('bcrypt');

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

module.exports = hashPassword;