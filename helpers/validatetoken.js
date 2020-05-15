const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
const accessTokenSecret = 'ahmedreemdalia';


async function CheckIfUserExixts(id) {
    let user = await userModel.findById(id);
    if (user) {
        return true;
    }
    return false;
}

function verifyAdmin(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized");
    }
    let token = (req.headers.authorization.split(" "))[1];
    if (token === null) {
        return res.status(401).send("Unauthorized");
    }
    else {
        jwt.verify(token, accessTokenSecret, async function (err, decoded) {
            if (err) {
                return res.status(403).send("Invalid Token");
            }
            else if (decoded.role !== "admin") {
                return res.status(401).send("Unauthorized: You are not Admin");
            }
            else {
                if (CheckIfUserExixts(decoded.subject)) {
                    req.userId = decoded.subject;
                    req.userRole = decoded.role;
                    next();
                }
                else{
                    return res.status(404).send("This user does not exist!");
                }
            }
        });
    }
}

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized");
    }
    let token = (req.headers.authorization.split(" "))[1];

    if (token === null) {
        return res.status(401).send("Unauthorized");
    } else {
        jwt.verify(token, accessTokenSecret, async function (err, decoded) {
            if (err) {
                return res.status(403).send("Invalid Token");
            }
            else {
                if (CheckIfUserExixts(decoded.subject)) {
                    req.userId = decoded.subject;
                    req.userRole = decoded.role;
                    next();
                }
                else{
                    return res.status(404).send("This user does not exist!");
                }
            }
        });
    }
}

module.exports = {
    verifyAdmin: verifyAdmin,
    verifyToken: verifyToken,
    accessTokenSecret: accessTokenSecret
};