const productService = require('../services/productService')

// Controller: getProducts
exports.getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();  // Fetch products from service layer
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        return res.status(200).json(products);  // Send products back to the client
    } catch (error) {
        console.log("Error in controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });  // Send error message
    }
};


exports.addProduct = async (req, res) => {

   
    try {
        const { name,price,category,subcategory,style } = req.body;
        const image = req.file;

         const added = await productService.addProduct(name,price,category,subcategory,style,image );
        if (!added)
            return res.status(409).json({ message: "product add failed " });
        return res.status(201).json({ message: "product added" })
    }
    catch (error) {
        console.log("controller error : " + error);
    }
}



exports.getProduct = async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL params

    try {
        // First, check if the product exists using checkProduct
        const productExists = await productService.checkProduct(id);

        // If the product doesn't exist, return a 404 response
        if (!productExists) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        // If the product exists, fetch its details using getProduct
        const product = await productService.getProduct(id);

        // If product is not found, send a 404 response
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        // Return the product data with a 200 status
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error in getProduct controller:", error);
        return res.status(500).json({ message: "Server error, please try again later." });
    }
};


exports.getProductsByCategory = async (req, res) => {
    const category = req.query.category;

    // Validate the category
    if (!category || !['rent', 'sale'].includes(category)) {
        return res.status(400).json({ message: 'Invalid category, must be "rent" or "sale".' });
    }

    try {
        // Call the service to fetch products based on category
        const products = await productService.getProductsByCategory(category);

        // If no products are found, return 404
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category.' });
        }

        // Return the products as JSON
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};



exports.addRent = async (req, res) => {
    const { id } = req.params;
    const { rents } = req.body; // Expecting an array of rent objects

    try {
        // Validate input
        if (!Array.isArray(rents) || rents.length === 0) {
            return res.status(400).json({ message: 'Rents array is required' });
        }

        // Add rents to the product
        const addedRents = await productService.addRentsToProduct(id, rents);
        res.status(201).json({ message: 'Rents added successfully', rents: addedRents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all rents for a product
exports.getRents = async (req, res) => {
    const { id } = req.params; // Correctly extract `id` from the URL parameters

    try {
        // Get rents for the product by passing the correct `id`
        const rents = await productService.getProductRents(id);
        res.status(200).json(rents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};