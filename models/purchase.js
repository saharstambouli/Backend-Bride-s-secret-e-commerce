const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }
    ],
    total_price: {
        type: Number
    },

    purchaseDate: {
        type: Date,
        default: Date.now 
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('purchase', purchaseSchema);
