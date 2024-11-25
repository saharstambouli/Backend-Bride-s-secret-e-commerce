const express = require('express')
const router = express.Router()
const authDto = require('../dtos/authDtos')
const dtoMiddleware = require('../middlewares/dtoMiddleware')
const authController = require('../controller/authController')
const authMiddleware = require('../middlewares/authMiddleware')
router.post('/login', authDto.loginDto, dtoMiddleware, authController.login)
 router.post('/forgetPassword', authDto.forgetPasswordDto, dtoMiddleware, authController.forgetPassword);
router.post('/resetPassword', authDto.resetPasswordDto, dtoMiddleware, authMiddleware.resetPasswordMiddleware, authController.resetPassword);

module.exports = router;