
const userService = require("../services/userService");
const productService = require("../services/productService");
const mailer = require("../NodeMailer/transporter")

const NewNewsletter = require("../models/NewsletterModel");


exports.register = async (req, res) => {
    try {
        const { UserName, email, password, isadmin } = req.body; // Include `isadmin`
        
        // Check if the user already exists
        if (await userService.checkUserExists(email)) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Pass `isadmin` to the user registration service
        const registered = await userService.register(UserName, email, password, isadmin);
        
        if (!registered) {
            return res.status(400).json({ message: 'Registration error' });
        }

        return res.status(201).json({ message: 'User Registered Successfully' });

    } catch (error) {
        console.error('Controller error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.getUser = async (req, res) => {
   try {
       const user = await userService.getuserByID(req.userID);
       return res.status(200).send(user);
   }
   catch (error) {
       console.log('controller error : ' + error);
   }
}

exports.addToCart = async (req, res) => {
    try {
        const { productID, quantity } = req.body;

        // Check if product is valid
        if (!await productService.checkProduct(productID)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        // Check if the requested quantity is available in stock
        if (!await productService.checkStock(quantity, productID)) {
            return res.status(400).json({ message: "Quantity out of stock" });
        }

        // Add the product to the user's cart and get the updated cart
        const updatedCart = await userService.addToCart(productID, quantity, req.userID);

        if (!updatedCart) {
            return res.status(400).json({ message: "Error while adding to cart" });
        }

        // Respond with the updated cart data
        return res.status(200).json({ message: "Added to cart successfully", cart: updatedCart });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};



exports.toggleWishList = async (req, res) => {
    try {
        const { productID } = req.body
        if (! await productService.checkProduct(productID)) {
            return res.status(404).json({ message: "product not found" });
            
        }
        const toggled = await userService.toggleWishList(req.userID, productID);
        if (!toggled) {
            return res.status(400).json({ message: "Toggle Failed" });
        }
        return res.status(200).json({ 
            message: `Product ${productID} ${toggled ? 'added to' : 'removed from'} wishlist successfully`, 
            wishList: toggled 
        });
    } catch (error) {

    }
}


exports.deleteFromCart = async (req, res) => {
    try {
        const { productID } = req.body;

        // Check if product is valid
        if (!await productService.checkProduct(productID)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        console.log("UserID in controller:", req.userID);

        // Call the service to delete the product from the cart
        const deleted = await userService.deleteFromCart(productID, req.userID);

        if (!deleted) {
            return res.status(400).json({ message: 'Error while deleting from cart' });
        }

        return res.status(200).json({ message: 'Deleted from cart successfully' });

    } catch (error) {
        console.log('Controller error: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




exports.purchase = async (req, res) => {
    try {
        const purchased = await userService.purchase(req.userID);
        if (!purchased) {
            return res.status(400).json({ message: "Purchase failed" });
        }
        return res.status(201).json({ message: "Purchased Successfully" });
    } catch (error) {
        console.error("Error during purchase process:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.deleteFromWishlist = async (req, res) => {
    try {
        const { productID } = req.body;

        // Check if product is valid
        const isValidProduct = await productService.checkProduct(productID);
        if (!isValidProduct) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        console.log("UserID in controller:", req.userID);

        // Call the service to delete the product from the wishlist
        const isDeleted = await userService.deleteFromWishlist(productID, req.userID);

        if (!isDeleted) {
            return res.status(400).json({ message: 'Error while deleting from wishlist' });
        }

        return res.status(200).json({ message: 'Deleted from wishlist successfully' });

    } catch (error) {
        console.log('Controller error: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.Newsletter = async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Request body:", req.body);
  
      // Check if the email is already subscribed
      const existingSubscription = await NewNewsletter.findOne({ email });
      if (existingSubscription) {
        return res.status(400).json({ message: "Email is already subscribed" });
      }
  
      // Create a new subscription
      const newSubscription = new NewNewsletter({
        userId, // Pass userId if you have it, otherwise it can be optional
        email,
      });
  
      await newSubscription.save();
  
      // Send the confirmation email
      try {
        await mailer.sendEmailNewsletter(email);
        return res.status(201).json({ message: "Check your email for confirmation" });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };



  exports.sendNewArrivalsUpdate = async (req, res) => {
    try {
      // Extract subject and content from the request body
      const { subject, content } = req.body;
  
      // Fetch all subscribed users
      const subscribers = await NewNewsletter.find({ isSubscribed: true });
  
      if (subscribers.length === 0) {
        return res.status(404).json({ message: "No subscribers found" });
      }
  
      // Extract the emails
      const emailList = subscribers.map((subscriber) => subscriber.email);
      console.log("Email list:", emailList);
  
      // Send update emails
      await mailer.sendUpdateEmail(emailList, subject, content);
      
       console.log("Updates sent to:", emailList); 
  
      return res.status(200).json({ message: "Updates sent successfully" });
    } catch (error) {
      console.error("Error sending updates:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };



  exports.handleContactForm = async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const savedMessage = await userService.saveMessage({ name, email, message });
      res.status(201).json({
        success: true,
        message: 'Message received successfully',
        data: savedMessage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving message',
        error: error.message,
      });
    }
  };