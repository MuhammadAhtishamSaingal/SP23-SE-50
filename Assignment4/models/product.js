const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    picture: { type: String },
    category:{ type: String },  // Reference to Category model
});

module.exports = mongoose.model('Product', productSchema);

