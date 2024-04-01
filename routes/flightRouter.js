const express = require("express");
const User = require("../models/user");
const authenticate = require("../authenticate");

const flightRouter = express.Router();

// Route for Flight List
flightRouter
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
    console.log(req.user);
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const trip = req.user.trips.id(req.params.tripId);
      if (!trip) {
        return res
          .status(404)
          .json({ message: "Unauthorized: Trip not found" });
      } else {
        res.status(200).json(trip.flights);
      }
    }
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

// Route for the Add Flight
flightRouter
  .route("/:tripId/add")
  .get(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /flights/add");
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    const { type, airline, ticketHolder } = req.body;
    const newFlight = { type, airline, ticketHolder };
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    }

    const tripIndex = req.user.trips.findIndex(
      (trip) => trip._id.toString() === req.params.tripId
    );

    if (tripIndex === -1) {
      return res.status(404).json({ message: "Trip not found" });
    } else {
      req.user.trips[tripIndex].flights.push(newFlight);
      req.user
        .save()
        .then((user) => {
          const addedFlight = user.trips[tripIndex].flights.slice(-1);
          res.status(200).json(addedFlight);
        })
        .catch((err) => next(err));
    }

    // console.log(tripId);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /flights/add");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /flights/add");
  });

// Route for Update Flight
flightRouter
  .route("/:flightId")
  .put(authenticate.verifyUser, (req, res, next) => {
    Flight.findByIdAndUpdate(
      req.params.flightId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((flight) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(flight);
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Flight.findByIdAndDelete(req.params.flightId)
      .then((flight) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(flight);
      })
      .catch((err) => next(err));
  });

//Error handling middleware

flightRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = flightRouter;
