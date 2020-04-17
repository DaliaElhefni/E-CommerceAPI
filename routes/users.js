const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
const Bcrypt = require('../helpers/bCrypt');
const userModel = require('../models/user');
const productModel = require('../models/product');
const validateUser = require('../helpers/validateUser');
const validateObjectId = require('../helpers/validateObjectId');

// hello

// Data : Full User Schema in Body
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
  await  userModel.findOne({"email":email},function(error,exists){
    if(error){
            res.send("Error With E-mail");
        }else if(!exists){
        // Hash The Password
    Bcrypt.hashPassword(user.password).then(async (hash)=>{
        user.password = hash
        
        // Check if There is an Admin Already
        // const checkAdminExists = Bcrypt.checkAdminExists("admin");
        Bcrypt.checkAdminExists("admin").then(async()=> {

            // Set user role to user if admin exists
            user.role = "user";
            // Save in DB And Send Token To Frontend
            user = await user.save(function(error,registeredUser){
                console.log(registeredUser.id);
                let payload = { subject:registeredUser.id}
                let token = jwt.sign(payload,'secretKey')
                res.status(200).send({token});
                
            });
        })
        .catch(async ()=> {
            // set user role to admin if not exists
            user.role = "admin";
            
            // Save in DB And Send Token To Frontend
            user = await user.save(function(error,registeredUser){
                console.log(registeredUser.id);
                let payload = { subject:registeredUser.id}
                let token = jwt.sign(payload,'admin')
                res.status(200).send({token});
                
            });
        })        

    }).catch((err)=> res.send(err));
        
}else if(exists){
            return res.send("Email Already Exists")            
        }
    })
            
});

// Data : (E-mail, password and Token) in Body
router.post('/login' , async(req,res)=>{

    // Check if E-mail Exists, Then Check Password
    let body = req.body;
   await userModel.findOne({"email":body.email},async function(error,user){
    if(error){
            res.send(error);
        }
        else if(!user){
                res.status(401).send("Invalid Email")
            }else if(user){
                console.log(user.username)            
                // Compare passwords and return user if success
                Bcrypt.comparePassword(body.password,user.password)
                .then((isMatch)=>{  
                    console.log(user.id)
                    let payload = { subject:user.id};
                    let token = jwt.sign(payload,'secretKey');
                    res.status(200).send({token});
                })
                .catch((error)=>res.send("Password Doesn't Match"))
            }
        }

    )
})

// Data : User ID & (Admin Token , Admin ID) in Body
router.get('/:id' , async(req,res)=>{
    const body = req.body;
    const {id} = req.params;
    const {error} = validateObjectId(id);
    if(error){
        return res.status(500).send("Invalid User ID");
    }

    // Decode Admin Token into Admin ID
    var adminId = jwtDecode(body.token);
        
    // Compare Admin ID Decoded Token
    if(adminId.subject == body.id){
        const user = await userModel.findById(id);
        res.send(user);
    }else{
       res.status(401).send("You are not Admin")
    }
    
    

})

// Data : (Admin Token , Admin ID) in Body
router.get('/get/all' , async(req,res)=>{

    console.log("GET")
    const body = req.body;
    
    // Decode Admin Token into Admin ID
    var adminId = jwtDecode(body.token);
        
    // Compare Admin ID Decoded Token
    if(adminId.subject == body.id){
        const user = await userModel.find();
        res.send(user);
    }else{
       res.status(401).send("You are not Admin")
    }
    
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

// Data : User ID & Data To be Modified in Body
router.put('/edit/:id',async(req,res)=>{
    const{id} = req.params;
    const{error} = validateObjectId(id);
    if(error){
        res.status(400).send("Invalid UserID");
    }
    
    let body = req.body;

    //check if there is a role in the body
    if('role' in body){
        Bcrypt.checkAdminExists("admin").then(()=>{
            body.role = "user";
            console.log(`admin already exists ,Your Role is ${body.role}`)
            })
        .catch(()=> {
            body.role = "admin"
        console.log(`admin doesn't exists, Your rule is ${body.role}`)    
    })
    } 
    
    if('password' in body){        
        // hash the password
         Bcrypt.hashPassword(body.password).then((hashValue)=>{                
            body.password = hashValue;})
            .catch((err)=>{res.send(err)});         
}


// userModel.findOne({_id: id},async function(err, user){
//      user = body;
//     await user.save(function(err) {
//         if(err){
//             console.log(user)
//             console.log("Error Saving")
//         }else{
//             res.send(user)
//         }
//     });
//  });

})

// Data : User ID & One Product Per Time {Product ID} in Body
router.put('/:id/product',async(req,res)=>{
    const{id} = req.params;
    const{error} = validateObjectId(id);
    if(error){
        res.status(400).send("Invalid UserID");
    }

    const body = req.body;

    // Check if Product Exists in DB
    // productModel.findById(body.id,function(error,product){
    //     if(error){
    //         res.status(401).send("Product Is Sold Out")
    //     }
    //     else{
    //         userModel.findOneAndUpdate(id,product.id);
    //         console.log()
    //     }
    // })

    var feed = {};

    userModel.findById(id,function(err,user){
        if(err){
            console.log("Error")
        }else{
            user.products.push(feed)
            // console.log(user)
        }
    })


})







module.exports = router;