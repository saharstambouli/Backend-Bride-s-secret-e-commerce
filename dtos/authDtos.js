const { body, check } = require('express-validator');

exports.loginDto = [
    body('email')
        .isEmail(),

    body('password')
        .isLength({ min: 8 })
    ,
    check().custom((value, { req }) => {
        const allowedProps = ["email", "password"];
        const unallowedProps = Object.keys(req.body).filter(prop => !allowedProps.includes(prop))
        if (unallowedProps.length > 0) {
            throw new Error(`Unexpected Fields : ${unallowedProps.join(',')}`);

        }
        return true;
    })
]

exports.forgetPasswordDto = [
    body('email')
        .isEmail(),

    check().custom((value, { req }) => {
        const allowedProps = ["email"];
        const unallowedProps = Object.keys(req.body).filter(prop => !allowedProps.includes(prop))
        if (unallowedProps.length > 0) {
            throw new Error(`Unexpected Fields : ${unallowedProps.join(',')}`);

        }
        return true;
    })
]



exports.resetPasswordDto = [
    body('newPassword')
        .isString({min:3}),

    check().custom((value, { req }) => {
        const allowedProps = ["newPassword"];
        const unallowedProps = Object.keys(req.body).filter(prop => !allowedProps.includes(prop))
        if (unallowedProps.length > 0) {
            throw new Error(`Unexpected Fields : ${unallowedProps.join(',')}`);

        }
        return true;
    })
]

exports.updatePasswordDto = [
    body('newPassword')
      .isString()
      .withMessage('New password must be a string')
      .isLength({ min: 3 })
      .withMessage('New password must be at least 3 characters long'),
  
    body('oldPassword')
      .isString()
      .withMessage('Old password must be a string')
      .isLength({ min: 3 })
      .withMessage('Old password must be at least 3 characters long'),
  
    check().custom((value, { req }) => {
      const allowedProps = ['newPassword', 'oldPassword']; // Correct array format
      const unallowedProps = Object.keys(req.body).filter(prop => !allowedProps.includes(prop));
  
      if (unallowedProps.length > 0) {
        throw new Error(`Unexpected Fields: ${unallowedProps.join(', ')}`);
      }
      return true;
    })
  ];