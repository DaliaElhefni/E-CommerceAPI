const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');


function verifyAdmin(req,res,next){
let token = req.headers.token;

    if(!token){
    res.status(401).send("Token Doesn't Exist");
}else if(token === null){
    res.status(401).send("Token Doesn't Exist");
}else{
    jwt.verify(token, 'admin', async function (err, decoded) {
            if (err) {
                res.status(401).send("Invalid Token or You are not Admin")
            } else {
                req.userId = decoded.subject;
                next();
            }
        });
    
}
}

function verifyToken(req,res,next){
    let token = req.headers.token;
    
        if(!token){
        res.status(401).send("Token Doesn't Exist");
    }else if(token === null){
        res.status(401).send("Token Doesn't Exist");
    }else{
       try{ 
       let decodedToken = jwt.decode(token)
       req.userId = decodedToken.subject;
        next();
       }catch{
        res.status(401).send("Invalid Token Error");

       }
    }
    }

module.exports = {
    verifyAdmin : verifyAdmin,
    verifyToken : verifyToken
};