const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const userDto = require('../dtos/userDto');
const dtoMiddleware = require('../middlewares/dtoMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userDto.userRegisterDTO, dtoMiddleware, userController.register)
router.get('/getUser',authMiddleware.jwtMiddleware,userController.getUser)
router.patch('/addToCart',authMiddleware.jwtMiddleware,userController.addToCart);
router.patch('/toggleProduct',authMiddleware.jwtMiddleware,userController.toggleWishList)
router.delete('/deleteFromCart',authMiddleware.jwtMiddleware,userController.deleteFromCart)
router.post('/purchase',authMiddleware.jwtMiddleware,userController.purchase)
router.delete('/deleteFromWishList',authMiddleware.jwtMiddleware,userController.deleteFromWishlist)
router.post('/send-newsletter',userController.Newsletter)


module.exports = router