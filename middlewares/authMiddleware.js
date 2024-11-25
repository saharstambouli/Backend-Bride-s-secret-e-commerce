const jwtService = require('jsonwebtoken');

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
