const jwt = require('jsonwebtoken');

const authMiddleWare = (req, res, next) => {

    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch(err){
        return res.status(401).json({message: "Invalid token"})
    }

}

module.exports = authMiddleWare;