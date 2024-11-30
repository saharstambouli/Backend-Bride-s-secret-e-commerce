const dashboardService= require ("../../services/dashboardService");
const jwtService = require("jsonwebtoken");


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const userExists = await dashboardService.checkUserExists(email);
        if (!userExists) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Verify credentials and retrieve user ID
        const userId = await dashboardService.login(email, password);
        if (!userId) {
            return res.status(401).json({ message: "Check your password" });
        }

        // Fetch the user details by ID
        const user = await dashboardService.getuserByID(userId);
        console.log("user",user)
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Check if the user is an admin
        if (!user.isadmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Generate JWT token
        const token = jwtService.sign(
            { id: userId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "8h" }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Controller error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getUser = async (req, res) => {
    try {
        // Call the service to fetch the user
        const user = await dashboardService.getuserByID(req.userID);

        // If the user is not found, send a 404 response
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // If the user is found, send it as a response
        return res.status(200).send(user); // Ensure res.send is used
    } catch (error) {
        console.error('Controller error:', error);

        // Send a 500 response in case of server errors
        return res.status(500).send({ error: 'Internal server error' });
    }
};




exports.getMonthlyOrders = async (req, res) => {
    try {
        const data = await dashboardService.getMonthlyOrders();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getMonthlyOrders controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

////////////////////////COUNT PRODUCTS /////////////

exports.productCountByCategory = async (req, res) => {
    try {
        const counts = await dashboardService.countProductsByCategory();
        if (!counts || counts.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        return res.status(200).json(counts); // Envoie les données regroupées par catégorie
    } catch (error) {
        console.error("Error counting products by category:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

///////////////////////////////LES REVENUES //////////////////////

exports.getDashboardData = async (req, res) => {
    try {
      const { month, year } = req.params;
  
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }
  
      // Fetch the monthly revenue using the service
      const revenueData = await dashboardService.getMonthlyRevenues(Number(month), Number(year));
  
      // Send both total revenue and monthly revenue data as a response
      return res.status(200).json(revenueData);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };


  exports.addReview = async (req, res) => {
    const { reviewText, rating } = req.body;

    // Validate input data
    if (!reviewText || !rating) {
        return res.status(400).json({ message: 'Le texte de l’avis et la note sont requis.' });
    }

    try {
        // Call the service to add the review
        const review = await dashboardService.addReview(req.userID, reviewText, rating);
        res.status(201).json({ message: 'Avis ajouté avec succès.', review });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
};




exports.getReviews = async (req, res) => {
    try {
        // Call the service to fetch reviews with user details
        const reviews = await dashboardService.getReviews();

        res.status(200).json({ message: 'Avis récupérés avec succès.', reviews });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
};

///////////////////////GET PURCHASES ///////////////////////////////////////


exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await dashboardService.getAllPurchases();
        res.status(200).json({
            success: true,
            data: purchases,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

////////////////////////DELETE PRODUCT ////////////////
// controllers/productController.js


exports.deleteProduct = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const deletedProduct = await dashboardService.deleteProductById(id);
        return res.status(200).json({
            message: 'Product deleted successfully',
            product: deletedProduct,
        });
    } catch (error) {
        const statusCode = error.message === 'Product not found' ? 404 : 500;
        return res.status(statusCode).json({
            message: error.message,
        });
    }
};

/////////////////////UPDATE PRODUCT///////////


exports.updateProduct = async (req, res) => {
    const { id, ...updateData } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const updatedProduct = await dashboardService.updateProductById(id, updateData);
        return res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        const statusCode = error.message === 'Product not found' ? 404 : 500;
        return res.status(statusCode).json({
            message: error.message,
        });
    }
};

///////////////////////////////GET PURCHASES //////////////

exports.fetchPurchases = async (req, res) => {
    try {
        const purchases = await dashboardService.getAllPurchases();

        if (!purchases || purchases.length === 0) {
            return res.status(404).json({ message: 'No purchases found.' });
        }

        return res.status(200).json({
            purchases,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching purchases.' });
    }
};


////////////GET USER//////////////////////////////////


exports.getUserCountController = async (req, res) => {
    try {
      const count = await dashboardService.getUserCount();  // Call the service to get user count
      res.status(200).json({ count });  // Return the count as a JSON response
    } catch (error) {
      res.status(500).json({ message: error.message });  // Return error message if something goes wrong
    }
  };
  
  exports.deleteRentByDatesAndProduct = async (req, res) => {
    const { startDate, endDate, productId } = req.body;
  
    try {
      const result = await dashboardService.deleteRentByDatesAndProduct(startDate, endDate, productId);
  
      if (!result) {
        return res.status(404).json({ message: 'No rent found for the given dates and product' });
      }
  
      res.status(200).json({ message: 'Rent deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting rent', error });
    }
  };
  