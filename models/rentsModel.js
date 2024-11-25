const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', 
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('rents', rentSchema);
