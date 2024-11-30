const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const userCartModel = require("../models/userCart");
const purchaseModel = require("../models/purchase");
const messageModel=require("../models/messageModel")
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

exports.checkUserExists = async (email) => {
    try {
        const user = await userModel.findOne({ email: email });

        return !!user;
    } catch (error) {
        console.log(error);
    }
};

exports.register = async (UserName, email, password, isadmin = false) => { // Default isadmin to false
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed password during registration:", hashedPassword);

        // Include isadmin when creating the user
        const newUser = new userModel({ UserName, email, password: hashedPassword, isadmin });
        
        await newUser.save();
        return true;
    } catch (error) {
        console.error("User registration error:", error);
        return false;
    }
};


exports.getuserByID = async (id) => {
    try {
        const user = await userModel.findById(id)
                   .select('UserName email cart favorites')
            .populate({
                path: "cart",
                populate: {
                    path: "product",
                    select: "price productID quantity image name"
                }
            });
        return user;
    } catch (error) {
        console.log(error);
        throw error; // Optionally, you can throw the error to handle it in the calling function
    }
};




exports.updateUser = async (email, key, value) => {
    try {
        const user = await userModel.findOne({ email });
        user[key] = value;
        await user.save();
        return true;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}




exports.getUserbyProp = async (prop, value) => {
    try {
        const selections = 'firstName lastName email cart favorites'
        const user = await userModel.findById(id).select(selections);
        return user;
    }
    catch (error) {
        console.log(error);
    }
}

exports.addToCart = async (productID, quantity, userID) => {
    try {
        const user = await userModel.findById(userID); // Find the user
        const product = await productModel.findById(productID); // Find the product
        const existingSubCart = await userCartModel.findOne({ userID, product }); // Check if product is already in cart

        if (existingSubCart) {
            // If the product exists in the cart, update the quantity
            existingSubCart.quantity += quantity;
            await existingSubCart.save();
        } else {
            // If the product doesn't exist in the cart, create a new sub-cart entry
            const newSubCart = new userCartModel({ userID: user, product, quantity });
            await newSubCart.save();
            user.cart.push(newSubCart); // Add to the user's cart
            await user.save();
        }

        // After adding or updating the cart, return the updated user and populate the cart field
        const updatedUser = await userModel.findById(userID).populate('cart').populate('cart.product'); // Populate cart and its products
        return updatedUser.cart;  // Return the populated cart array
    } catch (error) {
        console.log(error);
        return false;  // Return false in case of error
    }
};


// exports.deleteFromCart = async (productID, quantity, userID) => {
//     try {
//         const user = await userModel.findById(userID);

//         const product = await productModel.findById(productID);
//         const existingSubCart = await userCartModel.findOne({ userID, product });
//         if (existingSubCart) {
//             existingSubCart.quantity += quantity;
//             await existingSubCart.save();
//             return true;
//         }
//         const newSubCart = new userCartModel({ userID: user, product, quantity });
//         await newSubCart.save();
//         user.cart.push(newSubCart);
//         await user.save();
//         return true;
//     }
//     catch (error) {
//         console.log(error);
//         return false;
//     }
// }



exports.toggleWishList = async (userID, productID) => {
    try {
        // Find the user by ID
        const user = await userModel.findById(userID);
        if (!user) {
            console.log("User not found");
            return null;
        }

        // Find the product in the user's favorites list
        const foundProduct = user.favorites.findIndex((product) => product._id.toString() === productID);

        let msg = "";

        // If the product is already in the favorites list, remove it
        if (foundProduct !== -1) {
            user.favorites.splice(foundProduct, 1);
            msg = "Removed from";
        } else {
            // If the product is not in the favorites, add it
            const product = await productModel.findById(productID);
            if (!product) {
                console.log("Product not found");
                return null;
            }
            user.favorites.push(product);
            msg = "Added to";
        }

        // Save the updated user document
        await user.save();

        // Return the updated favorites list to the frontend
        return user.favorites; // Returning the updated list for frontend
    } catch (error) {
        console.log("Error in toggleWishList:", error);
        return null;
    }
};


exports.deleteFromCart = async (productID, userID) => {
    try {
        console.log('UserID in deleteFromCart:', userID);
        console.log('ProductID in deleteFromCart:', productID);

        // Find the user by ID
        const user = await userModel.findById(userID);
        if (!user) {
            console.log("User not found");
            return null;
        }

        // Find the product by ID
        const product = await productModel.findById(productID);
        if (!product) {
            console.log("Product not found");
            return null;
        }

        // Find the cart item for the user and product
        console.log("Looking for the user's cart with userID:", userID, "and productID:", productID);
        const existingSubCart = await userCartModel.findOne({ 
            userID: userID, 
            product: productID 
        });

        console.log("Existing SubCart:", existingSubCart);

        // Check if the cart item exists
        if (existingSubCart) {
            // Delete the cart item
            await userCartModel.deleteOne({ _id: existingSubCart._id });
            console.log("Product removed from cart successfully");
            return { message: "Product removed from cart successfully" };
        } else {
            console.log("Product not found in cart");
            return { message: "Product not found in cart" };
        }
    } catch (error) {
        console.log("Error in deleteFromCart:", error);
        throw error;
    }
};





exports.purchase = async (userID) => {
    try {
        let total_price = 0;
        const commande = new purchaseModel({ products: [] });

        // Get user data
        const user = await userModel.findById(userID);
        if (!user) {
            console.log("User not found!");
            return false;
        }

        for (const userCartID of user.cart) {
            const newProductPurchased = {};

            // Fetch the cart item and populate product details
            const data = await userCartModel.findById(userCartID).populate({
                path: "product",
                select: "name price quantity image category subcategory style" // Select necessary fields
            });

            console.log("data", data);

            // Check if cart item data is valid
            if (!data || !data.product) {
                console.log("No product found for cart item ID:", userCartID);
                continue;  // Skip this iteration if no valid product
            }

            // Access the product price and stock
            const price = parseFloat(data.product.price); // Ensure it's a number
            const productStock = data.product.quantity;
            const cartQuantity = data.quantity;

            console.log("Product Price:", price);
            console.log("Product Stock:", productStock);
            console.log("Cart Quantity:", cartQuantity);

            // Check if enough stock is available
            if (productStock < cartQuantity) {
                console.log(`Not enough stock for product ${data.product._id}`);
                continue;  // Skip this item if there's not enough stock
            }

            // Update total price
            total_price += price * cartQuantity;

            // Add product to the order
            newProductPurchased.quantity = cartQuantity;
            newProductPurchased.product = data.product; // Store the full product reference
            newProductPurchased.purchaseID = commande._id; 
            console.log("Adding product to order:", newProductPurchased);

            // Decrease product quantity and delete if out of stock
            const updatedProduct = await productModel.findByIdAndUpdate(
                data.product._id,
                { $inc: { quantity: -cartQuantity } }, // Decrease quantity
                { new: true } // Return the updated document
            );

            if (updatedProduct.quantity <= 0) {
                await productModel.deleteOne({ _id: updatedProduct._id });
            }

            // Push the product ObjectId to the order's products array
            commande.products.push(newProductPurchased.product._id); // Add product reference to the order
        }

        // Finalize the order
        commande.total_price = total_price;
        commande.userID = user;
        console.log("Final commande state before saving:", commande);
        await commande.save();

        // Clear the user's cart
        user.cart = [];
        await user.save();

        // Delete all user cart items
        while (await userCartModel.findOneAndDelete({ userID: user._id })) continue;

        // Add the purchase to the user's purchase history
        user.purchases.push(commande);
        await user.save();

        return true;
    } catch (error) {
        console.log("Error during purchase process:", error);
        return false;
    }
};


exports.getAllPurchases = async () => {
    try {
        // Fetch purchases and populate user and product details
        const purchases = await purchaseModel.find()
            .populate({
                path: 'userID',
                select: 'name email', // Select fields for user info
            })
            .populate({
                path: 'products', // Populate product details
                select: 'name price image category subcategory style quantity', // Specify fields to return
            });

        // Eliminate purchases with no products
        const validPurchases = purchases.filter(purchase => purchase.products.length > 0);

        return validPurchases;
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw new Error('Failed to fetch purchases: ' + error.message);
    }
};




exports.deleteFromWishlist = async (productID, userID) => {
    try {
        console.log('UserID in deleteFromWishlist:', userID);
        console.log('ProductID in deleteFromWishlist:', productID);

        // Find the user by ID
        const user = await userModel.findById(userID);
        if (!user) {
            console.log("User not found");
            return false;
        }

        // Find the index of the product in the favorites array
        const productIndex = user.favorites.findIndex((product) => product._id.toString() === productID);
        if (productIndex === -1) {
            console.log("Product not found in wishlist");
            return false;
        }

        // Remove the product from the favorites array
        user.favorites.splice(productIndex, 1);

        // Save the updated user document
        await user.save();
        console.log("Product removed from wishlist successfully");
        return true;

    } catch (error) {
        console.log("Error in deleteFromWishlist:", error);
        throw error;
    }
};


exports.saveMessage = async ({ name, email, message }) => {
    try {
      const newMessage = new messageModel({ name, email, message });
      return await newMessage.save();
    } catch (error) {
      throw new Error('Error saving message: ' + error.message);
    }
  };