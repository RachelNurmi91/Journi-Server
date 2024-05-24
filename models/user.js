const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema(
  {
    note: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const rentalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startLocation: {
      type: String,
    },
    endLocation: {
      type: String,
    },
    confirmationNo: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endDate: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    vehicleType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const transportationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    confirmationNo: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const insuranceSchema = new Schema(
  {
    name: {
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
    name: {
      type: String,
      required: true,
    },
    ship: {
      type: String,
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
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
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
    name: {
      type: String,
    },
    airport: {
      type: String,
    },
    destinationAirport: {
      type: String,
    },
    code: {
      type: String,
    },
    destinationCode: {
      type: String,
    },
    city: {
      type: String,
    },
    destinationCity: {
      type: String,
    },
    country: {
      type: String,
    },
    destinationCountry: {
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
    time: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const flightSchema = new Schema(
  {
    isRoundTrip: {
      type: Boolean,
      required: true,
    },
    nameOnReservation: {
      type: String,
      required: true,
    },
    departureFlight: {
      type: flightDetailsSchema,
      required: true,
    },
    returnFlight: {
      type: flightDetailsSchema,
      required: function () {
        return this.isRoundTrip; // Return flight is required only for round trips
      },
    },
  },
  {
    timestamps: true,
  }
);

const hotelSchema = new Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nameOnReservation: {
      type: String,
    },
    name: {
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
    name: {
      type: String,
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
    hotels: [hotelSchema],
    flights: [flightSchema],
    activities: [activitySchema],
    cruises: [cruiseSchema],
    rentals: [rentalSchema],
    insurance: [insuranceSchema],
    transportation: [transportationSchema],
    notes: [noteSchema],
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
    name: {
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
