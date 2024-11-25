const express=require('express');
const router=express.Router()
const userRoutes=require("./userRoutes");
 const authRoutes=require("./authRoute");
 const productRoutes=require("./productRoute");
 const dashboardRoutes=require("./dashboardRoute");
 
router.use('/user',userRoutes);
 router.use('/auth',authRoutes);
  router.use('/product',productRoutes);
  router.use('/dashboard',require('./dashboardRoute'));

module.exports=router;