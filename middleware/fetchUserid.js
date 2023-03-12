
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = "shhhhhhh";

const fetchUserid = (req,res,next)=>{
    const token  = req.header('auth-token');


    if(!token){
        res.status(401).send({error: "Please Authenticate using a valid token"})
    }

    try{
        const data = jwt.verify(token,JWT_SECRET_KEY);

        req.user = data.user;


        next();

    }

    catch(error){
        res.status(401).send({error,msg:"Please Authenticate usingg a valid token"})
    }

}


module.exports = fetchUserid;





