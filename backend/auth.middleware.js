const jwt = require('jsonwebtoken');

const authMiddleWare = (req, res, next) => {

    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    try{

        const {userId, role} = jwt.verify(token, process.env.JWT_SECRET);
        req.user = userId;
        req.role = role;
        req.userId = userId;
        next();

    } catch(err){
        return res.status(401).json({message: "Invalid token"})
    }

}

const adminMiddleWare = (req, res, next) => {

    if(!req.role || req.role !== 'admin'){
        res.status(403).json({message: "Forbidden, admin role required"});
        return;
    }
    next();

}

module.exports = {authMiddleWare, adminMiddleWare};