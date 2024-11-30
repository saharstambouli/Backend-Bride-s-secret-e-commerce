const express = require('express')
const router = express.Router()

const dashboardController = require("../controller/dashboard/dashboardController");
const authDto = require('../dtos/authDtos')
const dtoMiddleware = require('../middlewares/dtoMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')



router.get('/Nombredecommandes', dashboardController.getMonthlyOrders);
router.post('/login', authDto.loginDto, dtoMiddleware, dashboardController.login);
router.get('/countProducts', dashboardController.productCountByCategory);
router.get('/monthlyrevenues/:month/:year', dashboardController.getDashboardData);
router.post('/addreviews',authMiddleware.jwtMiddleware,dashboardController.addReview)
router.get('/getreviews',  dashboardController.getReviews);
router.get('/getallpurchases',  dashboardController.getAllPurchases);
router.get('/getuser',  dashboardController.getUser);
router.delete('/deleteproduct',  dashboardController.deleteProduct);
router.patch('/updateproduct',  dashboardController.updateProduct);
router.get('/getpurchases',dashboardController.fetchPurchases)
router.get('/getusers',dashboardController.getUserCountController)
router.delete('/deleterents',dashboardController.deleteRentByDatesAndProduct)

module.exports = router;