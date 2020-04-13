const express = require('express');
const userModel = require('../models/user');
const validateUser = require('../helpers/validateUser');
const validateObjectId = require('../helpers/validateObjectId');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/register',async(req,res)=>{
    // Validate Request
   let {error} = validateUser(req.body);
    if(error){
        return res.status(400).send(error.details);
    }
      // Use Schema
    let user = new userModel({...req.body})
    
    // Hash Password
    bcrypt.hash(user.password, 10, function(err, hash) {
        if(err){
            return res.send("Can't hash password");
        }
        user.password = hash;
    });

    // Save in DB
    user = await user.save();
    res.send(user)
});

router.get('/:id' , async(req,res)=>{

    const {id} = req.params;

    const {error} = validateObjectId(id);
    if(error){
        return res.status(500).send("Invalid User ID");
    }

    const user = await userModel.findById(id);
    console.log(user)

    res.send(user);


})



module.exports = router;