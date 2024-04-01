const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

// const flightDetailsSchema = new Schema({
//     airport: {
//         type: String,
//         required: true,
//     },
//     code: {
//         type: String,
//         required: true,
//     },
//     city: {
//         type: String,
//         required: true,
//     },
//     country: {
//         type: String,
//         required: true,
//     },
//     flightNo: {
//         type: String,
//         required: true,
//     },
//     date: {
//         type: Date,
//         required: true,
//     }
//     }, {
//         timestamps: true
// })

// const flightSchema = new Schema({
//     type: {
//         type: String,
//         required: true,
//     },
//     airline: {
//         type: String,
//         required: true,
//     },
//     departureFlight: [flightDetailsSchema],
//     returnFlight: [flightDetailsSchema],
//     ticketHolder: {
//         type: String,
//         required: true,
//     },
//     }, {
//         timestamps: true
// });

// const hotelSchema = new Schema({
//     arrival: {
//         type: Date,
//         required: true,
//     },
//     departure: {
//         type: Date,
//         required: true,
//     },
//     name: {
//         type: String,
//         required: true,
//     },
//     confirmation: {
//         type: String,
//     },
//     city: {
//         type: String,
//         required: true,
//     },
//     country: {
//         type: String,
//         required: true,
//     }
//     }, {
//         timestamps: true
// });

const tripSchema = new Schema(
  {
    tripName: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    // hotels: [hotelSchema],
    // flights: [flightSchema],
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    trips: [tripSchema],
  },
  {
    timestamps: true,
  }
);

// This plugs passportLocalMongoose into userScheam
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
