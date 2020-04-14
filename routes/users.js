const express = require('express');
const userModel = require('../models/user');
const validateUser = require('../helpers/validateUser');
const validateObjectId = require('../helpers/validateObjectId');
const router = express.Router();
const hashPassword = require('../helpers/passwordHashing');

// Hello From Ahmed

// Data : Full User Schema
router.post('/register',async(req,res)=>{
    // Validate Request Body
   let {error} = validateUser(req.body);
    if(error){
        return res.status(400).send(error.details);
    }

       
    // Use Schema
    let user = new userModel({...req.body})
    
    // Check if email Already Exists
    let email = user.email;
  await  userModel.findOne({"email":email},function(error,user){
        if(error){
            res.send("Error With E-mail");
        }else if(user){
           return res.send("Email Already Exists") 
        }
    })

    // Hash The Password
    hashPassword(user.password).then(async (hash)=>{
        user.password = hash
        console.log(user.password)
    // Save in DB
    user = await user.save();
    res.send(user)
    })
    .catch((err)=> res.send(err));
    

    
});

// Data : E-mail and password
router.post('/login' , async(req,res)=>{

    // Check if E-mail Exists, Then Check Password
    let body = req.body;
   await userModel.findOne({"email":body.email},async function(error,user){
        if(error){
            res.send(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid Email")
            }else if(user){
                
                // Hash the Password and compare it with the Hashed Password in the DB
                const hash = hashPassword(body.password)
                hash.then((hashValue)=>{
                    user.password == hashValue ? res.send(user) : res.status(401).send("Invalid Password");})
                .catch((err)=>{res.send(err)});                
            }
        }
    })


})

// Data : User ID
router.get('/:id' , async(req,res)=>{

    const {id} = req.params;
    console.log(id);
    const {error} = validateObjectId(id);
    if(error){
        return res.status(500).send("Invalid User ID");
    }

    const user = await userModel.findById(id);

    res.send(user);

})

// Data : User ID
router.delete('/:id' , async(req,res)=>{

    const {id} = req.body.params;

    const {error} = validateObjectId(id);
    if(error){
        return res.status(500).send("Invalid User ID");
    }

    const user = await userModel.findByIdAndDelete(id);
    console.log(user)

    res.send(`User ${req.body.username} Was Deleted Succesfully`);


})

// Data : ID & Data To be Modified
router.put('/edit/:id',async(req,res)=>{
    const{id} = req.params;
    const{error} = validateObjectId(id);
    if(error){
        res.status(400).send("Invalid UserID");
    }
    
    let body = req.body;

    // check if there is a password in the body
    if('password' in req.body){
        
        // hash the password
        const hash = hashPassword(req.body.password)
                hash.then(async(hashValue)=>{
                
                    body.password = hashValue;
                    // Update the DB
                   await userModel.findByIdAndUpdate(id,body,function(err,result){
                     if(err)
                     {
                         res.status(500).send(err);
                     }
                     else
                     {
                     res.send(result);
                     }
                 })          
                })
                .catch((err)=>{res.send(err)});         
}

})



module.exports = router;