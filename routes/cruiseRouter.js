const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const cruiseRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S CRUISE LIST ---- //
cruiseRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // Cruises are trip based, not user based.
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

        res.status(200).json(trip.cruises);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /cruises");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /cruises");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /cruises");
  });

// ---- ROUTE FOR ADDING A CRUISE TO A TRIP ---- //
cruiseRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /cruises/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a cruise the request body must contain a the id of the trip it will be added to.
    const { name, ship, startDate, endDate, confirmationNo, cabinNo, tripId } =
      req.body;

    const newCruise = {
      name,
      ship,
      startDate,
      endDate,
      confirmationNo,
      cabinNo,
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.cruises.push(newCruise);

      user
        .save()
        .then((user) => {
          const newCruise = user.trips.id(tripId).cruises.slice(-1);
          res.status(200).json({
            message: "Success: Cruise saved successfully",
            newCruise,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /cruises/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /cruises/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL CRUISE ---- //
cruiseRouter
  .route("/:cruiseId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the cruiseId will be in the url of the req.
  // Since we are focused on the individual cruise we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /cruises/${req.params.cruiseId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { name, ship, startDate, endDate, confirmationNo, cabinNo } =
      req.body;
    User.findOneAndUpdate(
      { "trips.cruises._id": req.params.cruiseId },
      {
        $set: {
          "trips.$[i].cruises.$[x].name": name,
          "trips.$[i].cruises.$[x].ship": ship,
          "trips.$[i].cruises.$[x].startDate": startDate,
          "trips.$[i].cruises.$[x].endDate": endDate,
          "trips.$[i].cruises.$[x].confirmationNo": confirmationNo,
          "trips.$[i].cruises.$[x].cabinNo": cabinNo,
        },
      },
      {
        arrayFilters: [
          { "i.cruises._id": req.params.cruiseId },
          { "x._id": req.params.cruiseId },
        ],
        new: true,
      }
    )
      .then((cruise) => {
        if (!cruise)
          return res.status(404).json({ message: "Error: Cruise not found" });
        cruise
          .save()
          .then((user) => {
            let updatedCruise;

            user.trips.forEach((trip) => {
              trip.cruises.forEach((cruise) => {
                if (cruise._id.toString() === req.params.cruiseId) {
                  updatedCruise = cruise;
                  return;
                }
              });
            });

            res.status(200).json({
              message: "Success: Cruise update saved successfully",
              updatedCruise,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /cruises/${req.params._id}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { cruiseId } = req.params;

      let cruiseIndex;
      let tripIndex;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.cruises.forEach((cruise, index) => {
          if (cruise._id.toString() === cruiseId.toString()) {
            tripIndex = userTripsIndex;
            cruiseIndex = index;
            return;
          }
        });
      });

      if (cruiseIndex === -1) {
        return res.status(404).json({ message: "Cruise not found" });
      } else {
        req.user.trips[tripIndex].cruises.splice(cruiseIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedCruise = user.trips[tripIndex].cruises[cruiseIndex];
          res.status(200).json(deletedCruise);
        });
      }
    }
  });

//Error handling middleware

cruiseRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = cruiseRouter;
