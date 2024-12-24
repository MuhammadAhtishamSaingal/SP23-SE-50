const mongoose = require('mongoose');

const category = new mongoose.Schema({

    title: { type: String, required: true },
    slug: String, //all-women

});

module.exports = mongoose.model('category', category);