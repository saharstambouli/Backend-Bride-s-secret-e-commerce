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

//////////////////////////GET REVIEWS //////////////////////


// exports.getReviews = async (req, res) => {
//     try {
//         // Call the service to fetch reviews
//         const reviews = await dashboardService.getReviews();
//         res.status(200).json({ message: 'Avis récupérés avec succès.', reviews });
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur serveur : ' + error.message });
//     }
// };


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
