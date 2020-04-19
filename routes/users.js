const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
const Bcrypt = require('../helpers/bCrypt');
const userModel = require('../models/user');
const productModel = require('../models/product');
const validateUser = require('../helpers/validateUser');
const validateObjectId = require('../helpers/validateObjectId');
const oktaJwtVerifier = require('@okta/jwt-verifier');

//add package multer to deal with profile image 
const multer = require('multer');
//determine the destination and image name
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './ProfileImages/');
    }
    ,
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
//add filter to image extension 

const fileFilter = (req, file, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        //accept
        callback(null, true);
    } else {
        //reject
        callback(null, false);
    }
};

// create  the middle ware to pass the image
const upload = multer({ storage: storage, fileFilter: fileFilter });


// Input : Full User Schema in Body 
// Output : Add User To DB
// add middleware to register with profile photo
router.post('/register' , upload.single('profileimage'),async(req,res)=>{
    // Validate Request Body
    let { error } = validateUser(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }


    // Use Schema
    let user = new userModel({...req.body  
    , 
    profileimage : req.file.path
    })
    
    // Check if email Already Exists
    let email = user.email;
    await userModel.findOne({ "email": email }, function (error, exists) {
        if (error) {
            res.send("Error With E-mail");
        } else if (!exists) {
            // Hash The Password
            Bcrypt.hashPassword(user.password).then(async (hash) => {
                user.password = hash

                // Check if There is an Admin Already
                // const checkAdminExists = Bcrypt.checkAdminExists("admin");
                Bcrypt.checkAdminExists("admin").then(async () => {

                    // Set user role to user if admin exists
                    user.role = "user";
                    // Save in DB And Send User Token To Frontend
                    user = await user.save(function (error, registeredUser) {
                        let payload = { subject: registeredUser.id }
                        let token = jwt.sign(payload, 'user')
                        res.status(200).send({ token });

                    });
                })
                    .catch(async () => {
                        // set user role to admin if not exists
                        user.role = "admin";

                        // Save in DB And Send Admin Token To Frontend
                        user = await user.save(function (error, registeredUser) {
                            let payload = { subject: registeredUser.id }
                            let token = jwt.sign(payload, 'admin')
                            res.status(200).send({ token });

                        });
                    })

            }).catch((err) => res.send(err));

        } else if (exists) {
            return res.send("Email Already Exists")
        }
    })

});

// Input : (E-mail, password) in Body
// Output : Tokin of The User
router.post('/login', async (req, res) => {

    // Check if E-mail Exists, Then Check Password 
    let body = req.body;
    await userModel.findOne({ "email": body.email }, async function (error, user) {
        if (error) {
            res.send("Error Finding E-mail");
        }
        else if (!user) {
            res.status(401).send("Invalid Email")
        } else if (user) {
            // Compare passwords and return user if success
            Bcrypt.comparePassword(body.password, user.password)
                .then((isMatch) => {
                    // Check if User is Admin or Normal user
                    if (user.role == "admin") {
                        let payload = { subject: user.id };
                        let token = jwt.sign(payload, 'admin');
                        res.status(200).send({ token });
                    } else if (user.role == "user") {
                        let payload = { subject: user.id };
                        let token = jwt.sign(payload, 'user');
                        res.status(200).send({ token });
                    }
                })
                .catch((error) => res.send("Password Doesn't Match"))
        }
    }

    )
})


// Input : (Name of The User To Be Searched ,  Admin Token ) in Body
// Output : (Specific User)
router.get('/get/:name', async (req, res) => {
    const body = req.body;
    const { name } = req.params

    // Verify and Decode Token
    jwt.verify(body.token, 'admin', async function (err, decoded) {
        if (err) {
            res.status(401).send("Invalid Token or You are not Admin")
        } else {
            let user = await userModel.find({ username: name });
            res.status(200).send(user)
        }
    });

})


// Input : User ID & (Admin Token) in Body
// Output : Specific User
router.get('/get/:id', async (req, res) => {
    const body = req.body;
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(500).send("Invalid User ID");
    }

    // Verify and Decode Token
    jwt.verify(body.token, 'admin', async function (err, decoded) {
        if (err) {
            res.status(401).send("Invalid Token or You are not Admin")
        } else {
            let user = await userModel.findById(id);
            res.status(200).send(user)
        }
    });

})

// Input : (Admin Token) in Body
// Output : All Users
router.get('/get/all', async (req, res) => {

    const body = req.body;

    // Verify and Decode Token
    jwt.verify(body.token, 'admin', async function (err, decoded) {
        if (err) {
            res.status(401).send("Invalid Token or You are not Admin")
        } else {
            let user = await userModel.find();
            res.status(200).send(user)
        }
    });


})

// Input : User ID and (User or Admin Token in Body)
// Output : User's Products
router.get('/:id/products', async (req, res) => {

    //const body = req.body;
    const { id } = req.params;


    // Verify and Decode Token
    jwt.verify(body.token, 'user', async function (err, decoded) {
        if (err) {
            res.status(401).send("Invalid Token or You are not The User")
        } else {
            userModel.findById(decoded.subject, async function (error, user) {
                if (error) {
                    res.status(401).send("Invalid User ID or User Not found")
                } else {
                    await user.populate('products', function (error, success) {
                        if (error) {
                            res.status(401).send("Error Populating")
                        }
                        else {
                            res.status(401).send(success.products)
                        }
                    });

                }
            })

        }
    });

    // // Get User Token
    // const userID = jwtDecode(body.token);

    // userModel.findById(userID, async function (error, user) {
    //     if (error) {
    //         res.status(401).send("Invalid User")
    //     } else {
    //         await user.populate('products', function (error, success) {
    //             if (error) {
    //                 res.status(401).send("Error Populating")
    //             }
    //             else {
    //                 res.status(401).send(success.products)
    //             }
    //         });

    //     }
    // })


})

// Input : (User or Admin Token) in Body
// Output : User's Orders
router.get('/:id/orders', async (req, res) => {

    const body = req.body;

    const userID = jwtDecode(body.token);

    userModel.findById(userID.subject, function (error, user) {
        if (error) {
            res.status(401).send("Invalid User")
        } else {
            res.status(401).send(user.orders)
        }
    })


})

// Input : User ID and (Admin Token) in body
// Output : Deletion Confirmation
router.delete('/:id', async (req, res) => {

    const { id } = req.params;
    const body = req.body;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(500).send("Invalid User ID");
    }

    if (body.token) {
        const adminToken = jwtDecode(body.token)

        userModel.findById(adminToken.subject, function (error, user) {
            if (error) {
                res.status(401).send("Invalid Admin ID")
            } else {
                if (user.role == "admin") {
                    userModel.findByIdAndDelete(id, function (error, success) {
                        if (!success) {
                            res.status(401).send("User Is Not Found")
                        } else if (success) {
                            res.status(401).send("Deleted Succesfully")
                        }
                    });
                }
                else {
                    res.status(401).send("You are not and Admin")
                }
            }

        })
    }
    else {
        res.status(401).send("No Token Sent")

    }

})

// Input : (User ID) And (Input To be Modified) in Body
// Output : Message
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        res.status(400).send("Invalid UserID");
    }

    let body = req.body;

    //check if there is a role in the body
    // if There is admin already in DB make The role = user
    // if not make the role = admin
    if ('role' in body) {
        Bcrypt.checkAdminExists("admin").then(() => {
            body.role = "user";
        })
            .catch(() => {
                body.role = "admin";
            })
    }

    if ('password' in body) {
        // hash the password
        Bcrypt.hashPassword(body.password).then((hashValue) => {
            body.password = hashValue;
        })
            .catch((err) => { res.send(err) });
    }


    await userModel.findByIdAndUpdate(id, body, function (error, success) {
        if (error) {
            res.status(401).send("Error Can't Update")
        } else {
            res.status(401).send("Updated Succesfuly")
        }
    })

})

// Input : User ID & One Product Per Time {Product ID} in Body
// Output :
router.post('/:id/product', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        res.status(400).send("Invalid UserID");
    }

    // const body = req.body;

    let product = new productModel({ ...req.body });

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

    userModel.findById(id, async function (err, user) {

        if (err) {
            console.log("Error")
        } else {
            console.log(user)

            await user.products.push(product.id);
            await user.save();
            res.status(200).send("Product Added To cart");

        }
    })


})




module.exports = router;
