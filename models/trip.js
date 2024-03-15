const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    departure: {
        type: Date,
        required: true,
    },
    }, {
        timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema)

module.exports = Trip