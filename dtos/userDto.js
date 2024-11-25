const { body, check } = require('express-validator');

exports.userRegisterDTO = [
    body('UserName')
        .isString()
        .isLength({ min: 3, max: 20 })
        .withMessage('UserName must be between 3 and 20 characters long'),
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('isadmin')
        .optional() // Mark isadmin as optional
        .isBoolean()
        .withMessage('isadmin must be a boolean value'),
    check().custom((value, { req }) => {
        const allowedProps = ["UserName", "email", "password", "isadmin"];
        const unallowedProps = Object.keys(req.body).filter(
            (prop) => !allowedProps.includes(prop)
        );
        if (unallowedProps.length > 0) {
            throw new Error(`Unexpected Fields : ${unallowedProps.join(',')}`);
        }
        return true;
    }),
];

