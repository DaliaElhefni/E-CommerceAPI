const bcrypt = require('bcrypt');
const userModel = require('../models/user');



function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        return reject(error);
      }
      else {
        bcrypt.hash(password, salt, (error, hash) => error ? reject(error) : resolve(hash));
      }
    });
  });
}

function comparePassword(bodyPassword, dbPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(bodyPassword, dbPassword, function (err, isMatch) {
      if (err) {
        reject(err);
      } 
      else if (!isMatch) {
        reject("Password doesn't match!");
      } 
      else {
        resolve();
      }
    });
  });
}

function checkAdminExists(admin) {
  console.log("Hello");

  return new Promise((resolve, reject) => {
    userModel.findOne({ "role": admin }, function (error, exists) {
      if (error || !exists) {
        reject(error)
      } 
      else if (exists) {
        resolve(exists)
      }
    })
  })
}

module.exports = {
  hashPassword: hashPassword,
  comparePassword: comparePassword,
   checkAdminExists: checkAdminExists
};