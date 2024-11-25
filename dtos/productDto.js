const { body, check } = require('express-validator');

exports.addProductDto = [
    body('name')
        .trim()
        .isString()
        .isLength({ max: 50 })
    ,

    body('price')
    .optional()  // Allows the field to be omitted
    .isFloat({ min: 1 })  // Validates the value if it's present
    .withMessage('Price must be a float greater than or equal to 1'),
    
    check().custom((value, { req }) => {
        const allowedProps = ["name", "price" , "style","category","subcategory","image","onSale"];
        const unallowedProps = Object.keys(req.body).filter(prop => !allowedProps.includes(prop))
        if (unallowedProps.length > 0) {
            throw new Error(`Unexpected Fields : ${unallowedProps.join(',')}`);

        }
        return true;
    })


]