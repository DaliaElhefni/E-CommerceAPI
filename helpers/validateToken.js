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
    let token = req.headers.token;

    if (!token) {
        res.status(401).send("Token Doesn't Exist");
    }
    else if (token === null) {
        res.status(401).send("Token Doesn't Exist");
    }
    else {
        jwt.verify(token, accessTokenSecret, async function (err, decoded) {
            if (err) {
                res.status(403).send("Invalid Token");
            }
            else if (decoded.role !== "admin") {
                res.status(401).send("You are not Admin");
            }
            else {
                if (CheckIfUserExixts(decoded.subject)) {
                    req.userId = decoded.subject;
                    req.userRole = decoded.role;
                    next();
                }
                else{
                    res.status(404).send("This user does not exist!");
                }
            }
        });
    }
}

function verifyToken(req, res, next) {
    let token = req.headers.token;

    if (!token) {
        res.status(401).send("Token Doesn't Exist");
    } else if (token === null) {
        res.status(401).send("Token Doesn't Exist");
    } else {
        jwt.verify(token, accessTokenSecret, async function (err, decoded) {
            if (err) {
                res.status(403).send("Invalid Token");
            }
            else {
                if (CheckIfUserExixts(decoded.subject)) {
                    req.userId = decoded.subject;
                    req.userRole = decoded.role;
                    next();
                }
                else{
                    res.status(404).send("This user does not exist!");
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