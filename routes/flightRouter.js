const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const flightRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S FLIGHT LIST ---- //
flightRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // Flights are trip based, not user based.
    // The request body must contain a specified tripId.

    User.findById(req.user._id)
      .then((user) => {
        if (!user)
          return res
            .status(404)
            .json({ message: "Unauthorized: User not found" });

        // Search the trips for an id that matches our request.

        const trip = req.user.trips.id(req.body.tripId);

        if (!trip)
          return res
            .status(404)
            .json({ message: "Unauthorized: Trip not found" });

        res.status(200).json(trip.flights);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /flights");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /flights");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /flights");
  });

// ---- ROUTE FOR ADDING A FLIGHT TO A TRIP ---- //
flightRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /flights/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a flight the request body must contain a the id of the trip it will be added to.

    const {
      isRoundTrip,
      nameOnReservation,
      tripId,
      departureFlight,
      returnFlight,
    } = req.body;

    const newFlight = {
      isRoundTrip,
      nameOnReservation,
      departureFlight: {
        confirmationNo: departureFlight.confirmationNo,
        airport: departureFlight.airport,
        city: departureFlight.city,
        code: departureFlight.code,
        country: departureFlight.country,
        date: departureFlight.date,
        time: departureFlight.time,
        flightNo: departureFlight.flightNo,
        name: departureFlight.name,
        seat: departureFlight.seat,
        destinationAirport: departureFlight.destinationAirport,
        destinationCity: departureFlight.destinationCity,
        destinationCode: departureFlight.destinationCode,
        destinationCountry: departureFlight.destinationCountry,
      },
      returnFlight: {
        confirmationNo: returnFlight.confirmationNo,
        airport: returnFlight.airport,
        city: returnFlight.city,
        code: returnFlight.code,
        country: returnFlight.country,
        date: returnFlight.date,
        time: returnFlight.time,
        flightNo: returnFlight.flightNo,
        name: returnFlight.name,
        seat: returnFlight.seat,
      },
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.flights.push(newFlight);

      user
        .save()
        .then((user) => {
          const newFlight = user.trips.id(tripId).flights.slice(-1);
          res.status(200).json({
            message: "Success: Flight saved successfully",
            newFlight,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /flights/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /flights/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL FLIGHT ---- //
flightRouter
  .route("/:flightId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the flightId will be in the url of the req.
  // Since we are focused on the individual flight we do not need the tripId sent over in the req body.
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /flights/${req.params.flightId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { isRoundTrip, nameOnReservation, departureFlight, returnFlight } =
      req.body;

    User.findOneAndUpdate(
      { "trips.flights._id": req.params.flightId },
      {
        $set: {
          "trips.$[i].flights.$[x].isRoundTrip": isRoundTrip,
          "trips.$[i].flights.$[x].nameOnReservation": nameOnReservation,
          "trips.$[i].flights.$[x].departureFlight": departureFlight,
          "trips.$[i].flights.$[x].returnFlight": returnFlight,
        },
      },
      {
        arrayFilters: [
          { "i.flights._id": req.params.flightId },
          { "x._id": req.params.flightId },
        ],
        new: true,
      }
    )
      .then((flight) => {
        if (!flight)
          return res.status(404).json({ message: "Error: Flight not found" });
        flight
          .save()
          .then((user) => {
            let updatedFlight;

            user.trips.forEach((trip) => {
              trip.flights.forEach((flight) => {
                if (flight._id.toString() === req.params.flightId) {
                  updatedFlight = flight;
                  return;
                }
              });
            });

            res.status(200).json({
              message: "Success: Activity update saved successfully",
              updatedCruise: updatedFlight,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /flights/${req.params.flightId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { flightId } = req.params;

      let flightFound = false;
      let flightIndex = -1;
      let tripIndex = -1;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.flights.forEach((flight, index) => {
          if (flight._id.toString() === flightId.toString()) {
            tripIndex = userTripsIndex;
            flightIndex = index;
            flightFound = true;
          }
        });
      });

      if (!flightFound) {
        return res.status(404).json({ message: "Flight not found" });
      } else {
        const deletedFlight = req.user.trips[tripIndex].flights[flightIndex];
        req.user.trips[tripIndex].flights.splice(flightIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          res.status(200).json(deletedFlight);
        });
      }
    }
  });

//Error handling middleware

flightRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = flightRouter;
