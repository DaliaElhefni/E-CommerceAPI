const express = require('express');
const userModel = require('../models/user');

const router = express.Router();

router.post('/',async(req,res)=>{

    console.log(req.body);

    let user = new userModel({...req.body})
    console.log(user);

    user = await user.save();
    res.send(user)
});

module.exports = router;