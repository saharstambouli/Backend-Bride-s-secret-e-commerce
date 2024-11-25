
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const purchaseModel = require("../models/purchase");
const Review = require("../models/Reviews");

const mongoose = require('mongoose');
const moment = require('moment')

const bcrypt = require('bcryptjs');

exports.checkUserExists = async (email) => {
    try {
        const user = await userModel.findOne({ email: email });
        return user;
        console.log("user", user)
    } catch (error) {
        console.error("Error in checkUserExists:", error);
        throw error;
    }
};





// exports.login = async (email, password) => {
//     try {

//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return null;
//         }


//         const passwordMatch = await bcrypt.compare(password, user.password);
//         console.log("Provided password:", password);
//         console.log("Stored hashed password:", user.password);
//         console.log("Password comparison result:", isPasswordValid);
//         if (!passwordMatch) {
//             return null;
//         }


//         if (!user.isadmin) {
//             return null;
//         }


//         return user._id;

//     } catch (error) {
//         console.log(error);
//     }
// };



exports.login = async (email, password) => {
    try {
        const user = await userModel.findOne({ email });
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log("Is password valid?", passwordMatch);
      
        return (passwordMatch ? user._id : null);
    }
    catch (error) {
        console.log(error);
    }
}




exports.getuserByID = async (id) => {
    try {
        const user = await userModel.findById(id)
                   .select('UserName email cart favorites isadmin')
            .populate({
                path: "cart",
                populate: {
                    path: "product",
                    select: "price productID quantity image name isadmin"
                }
            });
        return user;
    } catch (error) {
        console.log(error);
        throw error; // Optionally, you can throw the error to handle it in the calling function
    }
};



///////////////////////////COUNT PRODUCTS /////////////////////


// Compte les produits par catégorie avec gestion des erreurs
exports.countProductsByCategory = async () => {
    try {
        const result = await productModel.aggregate([
            {
                $group: {
                    _id: "$category",
                    total: { $sum: 1 },
                }
            },
            {
                $project: {
                    category: "$_id",
                    total: 1,
                    _id: 0,
                }
            }
        ]);

        return result;
    } catch (error) {
        console.error("Error in countProductsByCategory service:", error);
        throw new Error("Failed to count products by category"); // Relancer l'erreur pour la gérer dans le contrôleur
    }
};


// exports.getMonthlyOrders = async () => {
//     try {
//         const monthlyOrders = await purchaseModel.aggregate([
//             {
//                 $unwind: "$products" // Assuming products is an array in the order
//             },
//             {
//                 $group: {
//                     _id: {
//                         year: { $year: "$createdAt" },
//                         month: { $month: "$createdAt" }
//                     },
//                     totalOrders: { $sum: 1 },
//                     products: {
//                         $push: {
//                             productId: "$products.productId",
//                             purchaseDate: "$createdAt",
//                             price: "$products.price"
//                         }
//                     }
//                 }
//             },
//             { $sort: { "_id.year": 1, "_id.month": 1 } }
//         ]);

//         return monthlyOrders.map((entry) => ({
//             year: entry._id.year,
//             month: entry._id.month,
//             totalOrders: entry.totalOrders,
//             products: entry.products // This includes product details for each order
//         }));
//     } catch (error) {
//         console.error("Error in getMonthlyOrders service:", error);
//         throw new Error("Failed to fetch monthly orders");
//     }
// };


exports.getMonthlyOrders = async () => {
    try {
        const monthlyOrders = await purchaseModel.aggregate([
            // Match only purchases with non-empty products array
            {
                $match: {
                    products: { $ne: [] } // Filters out purchases where the products array is empty
                }
            },
            // Unwind the products array
            {
                $unwind: "$products"
            },
            // Group by year and month
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalOrders: { $sum: 1 }, // Count total orders
                    totalPrice: { $sum: "$total_price" }, // Sum total price for each group
                    productIds: { $push: "$products" } // Collect all product IDs
                }
            },
            // Sort by year and month
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        return monthlyOrders.map((entry) => ({
            year: entry._id.year,
            month: entry._id.month,
            totalOrders: entry.totalOrders,
            totalPrice: entry.totalPrice,
            productIds: entry.productIds // Array of product IDs
        }));
        
        
    } catch (error) {
        console.error("Error in getMonthlyOrders service:", error);
        throw new Error("Failed to fetch monthly orders");
    }
};










/////////////////////////////LES REVENUES //////////////////////

exports.getMonthlyRevenues = async (month, year) => {
    try {
        // Get the first and last day of the given month and year
        const startDate = moment().year(year).month(month - 1).startOf('month').startOf('day').toDate(); // 12:00 AM on the 1st
        const endDate = moment().year(year).month(month - 1).endOf('month').endOf('day').toDate();   // 11:59:59 PM on the last day

        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);


        // Query purchases within the given date range
        const purchases = await purchaseModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$createdAt' }, // Group by day of month
                    totalRevenue: { $sum: '$total_price' }, // Sum the total price for each day
                },
            },
            {
                $sort: { '_id': 1 }, // Sort by day of the month
            },
            {
                $project: {
                    date: { 
                        $dateToString: { 
                            format: '%Y-%m-%d', 
                            date: {
                                $dateFromParts: {
                                    year: year,
                                    month: month,
                                    day: '$_id'
                                }
                            }
                        }
                    },
                    totalRevenue: 1,
                },
            },
        ]);

        // Calculate the total revenue for the month (summed up from all days)
        const totalRevenue = purchases.reduce((sum, day) => sum + day.totalRevenue, 0);

        // Format the data for monthlyRevenueData (daily revenue)
        const monthlyRevenueData = purchases.map((item) => ({
            date: item.date,
            revenue: item.totalRevenue,
        }));

        // Return both totalRevenue and monthlyRevenueData
        return {
            totalRevenue,
            monthlyRevenueData,
        };
    } catch (error) {
        throw new Error('Error calculating monthly revenue: ' + error.message);
    }
};


exports.addReview = async (userID, reviewText, rating) => {
    try {
        // Check if the user exists
        const user = await userModel.findById(userID);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Create and save the new review
        const newReview = new Review({ userId: userID, reviewText, rating });
        return await newReview.save();
    } catch (error) {
        throw new Error('Erreur lors de l’ajout de l’avis : ' + error.message);
    }
}


////////////////////GET REVIEWS ////////////////////


// exports.getReviews = async () => {
//     try {
//         // Fetch all reviews from the database, selecting only `reviewText` and `rating`
//         return await Review.find({}, 'reviewText rating');
//     } catch (error) {
//         throw new Error('Erreur lors de la récupération des avis : ' + error.message);
//     }
// };

exports.getReviews = async () => {
    try {
        // Fetch all reviews with `reviewText`, `rating`, `userId`, and `createdAt`
        const reviews = await Review.find({}, 'reviewText rating userId createdAt');

        // For each review, fetch the user details using the `userId`
        const reviewsWithUserDetails = await Promise.all(reviews.map(async (review) => {
            const user = await userModel.findById(review.userId).select('UserName'); // Fetch user by userId
            return {
                reviewText: review.reviewText,
                rating: review.rating,
                userName: user ? user.UserName : null,  // Safeguard if user is not found
                reviewDate: review.createdAt,  // Review date
            };
        }));

        return reviewsWithUserDetails;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des avis : ' + error.message);
    }
};



exports.getAllPurchases = async () => {
    try {
        // Fetch purchases first and populate userID
        const purchases = await purchaseModel.find()
            .populate({
                path: 'userID',
                select: 'name email', // Select fields for user info
            });
        
        // Manually populate the products array
        for (let purchase of purchases) {
            await purchase.populate({
                path: 'products', // Populate the products references
                model: 'product', // Specify the 'product' model to populate the products
                select: 'name price image category subcategory style quantity', // Select relevant product fields
            });
        }

        // Filter out purchases that do not have a total_price (null, undefined, or 0)
        const validPurchases = purchases.filter(purchase => purchase.total_price && purchase.total_price > 0);

        return validPurchases;
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw new Error('Failed to fetch purchases: ' + error.message);
    }
};


