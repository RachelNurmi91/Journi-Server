const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");

const flightRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S FLIGHT LIST ---- //
flightRouter
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
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
  .post(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /flights");
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /flights");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /flights");
  });

// ---- ROUTE FOR ADDING A FLIGHT TO A TRIP ---- //
flightRouter
  .route("/add")
  .get(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /flights/add");
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    // To add a flight the request body must contain a the id of the trip it will be added to.

    const { type, airline, ticketHolder, tripId } = req.body;
    const newFlight = { type, airline, ticketHolder };

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
  .put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /flights/add");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /flights/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL FLIGHT ---- //
flightRouter
  .route("/:flightId")

  // At this point the flightId will be in the url of the req.
  // Since we are focused on the individual flight we do not need the tripId sent over in the req body.

  .get(authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /flights/${req.params.flightId}`);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    const { type, airline, ticketHolder } = req.body;
    User.findOneAndUpdate(
      { "trips.flights._id": req.params.flightId },
      {
        $set: {
          "trips.$[i].flights.$[x].type": type,
          "trips.$[i].flights.$[x].airline": airline,
          "trips.$[i].flights.$[x].ticketHolder": ticketHolder,
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
              message: "Success: Flight update saved successfully",
              updatedFlight,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /flights/${req.params.flightId}`);
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user)
          return res
            .status(404)
            .json({ message: "Unauthorized: User not found" });

        const tripIndex = user.trips.findIndex((trip) => {
          return trip.flights.find(
            (flight) => flight._id.toString() === req.params.flightId
          );
        });

        if (tripIndex === -1)
          return res.status(404).json({ message: "Error: Flight not found" });

        user.trips[tripIndex].flights = user.trips[tripIndex].flights.filter(
          (flight) => flight._id.toString() !== req.params.flightId
        );

        user
          .save()
          .then((user) => {
            let updatedTrip = user.trips[tripIndex];

            res.status(200).json({
              message: "Success: Flight deleted successfully",
              updatedTrip,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

//Error handling middleware

flightRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = flightRouter;
