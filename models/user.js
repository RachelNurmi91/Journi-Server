const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const insuranceSchema = new Schema(
  {
    insuranceProvider: {
      type: String,
      required: true,
    },
    policyNo: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const cruiseSchema = new Schema(
  {
    cruiseLine: {
      type: String,
      required: true,
    },
    cruiseShip: {
      type: String,
      required: true,
    },
    nameOnReservation: {
      type: String,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    confirmationNo: {
      type: String,
    },
    cabinNo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const activitySchema = new Schema(
  {
    activityName: {
      type: String,
      required: true,
    },
    activityDate: {
      type: Date,
      required: true,
    },
    activityTime: {
      type: Date,
    },
    location: {
      type: String,
    },
    confirmation: {
      type: String,
    },
    addOns: {
      addedComments: {
        type: Boolean,
      },
      comments: {
        type: String,
      },
      addedTicket: {
        type: Boolean,
      },
      ticketNo: {
        type: String,
      },
      ticketUploads: {
        type: Array,
      },
    },
  },
  {
    timestamps: true,
  }
);

const flightDetailsSchema = new Schema(
  {
    airport: {
      type: String,
    },
    code: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    flightNo: {
      type: String,
    },
    seat: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const flightSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    airline: {
      type: String,
      required: true,
    },
    confirmationNo: {
      type: String,
    },
    departureFlight: [flightDetailsSchema],
    returnFlight: [flightDetailsSchema],
    ticketHolder: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const hotelSchema = new Schema(
  {
    arrivalDate: {
      type: Date,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    nameOnReservation: {
      type: String,
    },
    hotel: {
      type: String,
      required: true,
    },
    confirmationNo: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

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
    hotels: [hotelSchema],
    flights: [flightSchema],
    activities: [activitySchema],
    cruises: [cruiseSchema],
    // rentals: [rentalSchema],
    insurance: [insuranceSchema],
    // transportation: [transportationSchema],
    selections: {
      flights: {
        type: Boolean,
      },
      hotels: {
        type: Boolean,
      },
      rentalCar: {
        type: Boolean,
      },
      cruise: {
        type: Boolean,
      },
      transportation: {
        type: Boolean,
      },
      insurance: {
        type: Boolean,
      },
    },
  },
  {
    timestamps: true,
  }
);

const rewardProgramSchema = new Schema(
  {
    programName: {
      type: String,
      required: true,
    },
    membershipId: {
      type: String,
      required: true,
    },
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
    rewardPrograms: [rewardProgramSchema],
    trips: [tripSchema],
  },
  {
    timestamps: true,
  }
);

// This plugs passportLocalMongoose into userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
