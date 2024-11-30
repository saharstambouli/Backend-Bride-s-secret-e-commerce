const jwtService = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.jwtMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "no token provided" });
        }
        const decodedJWT = jwtService.verify(token, process.env.JWT_SECRET_KEY);
        req.userID = decodedJWT.id
        next();
    }
    catch (error) {
        return res.status(401).send(error);
    }
}




exports.resetPasswordMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "no token provided" });
        }
        const decodedToken = jwtService.verify(token, process.env.JWT_RESET_KEY);
        req.codeForgetPassword = decodedToken.code
        next();
    }
    catch (error) {
        return res.status(401).send(error);
    }
}

exports.jwtMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "no token provided" });
        }
        const decodedJWT = jwtService.verify(token, process.env.JWT_SECRET_KEY);
        req.userID = decodedJWT.id
        next();
    }
    catch (error) {
        return res.status(401).send(error);
    }
}


exports.jwtupdatePassword = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided or malformed header" });
        }

        const token = authHeader.split(' ')[1];
        console.log('Received Token:', token); // Debug log

        const decodedJWT = jwtService.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Decoded JWT:', decodedJWT); // Debug log

        const user = await userModel.findById(decodedJWT.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};