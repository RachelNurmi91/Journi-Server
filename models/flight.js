const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flightDetailsSchema = new Schema({
    airport: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    flightNo: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
    }, {
        timestamps: true
})

const flightSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    airline: {
        type: String,
        required: true,
    },
    departureFlight: [flightDetailsSchema],
    returnFlight: [flightDetailsSchema],
    ticketHolder: {
        type: String,
        required: true,
    },
    }, {
        timestamps: true
});

const Flight = mongoose.model('Flight', flightSchema)

module.exports = Flight