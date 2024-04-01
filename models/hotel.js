const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    arrival: {
        type: Date,
        // required: true,
    },
    departure: {
        type: Date,
        // required: true,
    },
    name: {
        type: String,
        required: true,
    },
    confirmation: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }
    }, {
        timestamps: true
});

const Hotel = mongoose.model('Hotel', hotelSchema)

module.exports = Hotel