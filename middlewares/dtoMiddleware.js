const { validationResult } = require("express-validator")

const dtoMiddleware = async (req, res, next) => {
    const validation = validationResult(req);
    if (validation.errors.length != 0) {
        const result = {}
        for (error of validation.errors) {
            error.path == "" ?
                result["error"] = error.msg :
                result[error.path] = error.msg;
        }
        return res.status(400).json(result);
    }


    next();
}

module.exports = dtoMiddleware