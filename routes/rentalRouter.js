const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const rentalRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S HOTEL LIST ---- //
rentalRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // Rentals are trip based, not user based.
    // The request body must contain a specified tripId.s

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

        res.status(200).json(trip.rentals);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /rentals");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /rentals");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /rentals");
  });

// ---- ROUTE FOR ADDING A HOTEL TO A TRIP ---- //
rentalRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /rentals/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a rental the request body must contain a the id of the trip it will be added to.
    const {
      name,
      startDate,
      endDate,
      startTime,
      endTime,
      vehicleType,
      confirmationNo,
      startLocation,
      endLocation,
      tripId,
    } = req.body;

    const newRental = {
      name,
      startDate,
      endDate,
      startTime,
      endTime,
      vehicleType,
      confirmationNo,
      startLocation,
      endLocation,
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.rentals.push(newRental);

      user
        .save()
        .then((user) => {
          const newRental = user.trips.id(tripId).rentals.slice(-1);
          res.status(200).json({
            message: "Success: Rental saved successfully",
            newRental,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /rentals/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /rentals/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL HOTEL ---- //
rentalRouter
  .route("/:rentalId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the rentalId will be in the url of the req.
  // Since we are focused on the individual rental we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /rentals/${req.params.rentalId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const {
      startDate,
      startTime,
      startLocation,
      endDate,
      endTime,
      endLocation,
      name,
      confirmationNo,
      vehicleType,
    } = req.body;
    User.findOneAndUpdate(
      { "trips.rentals._id": req.params.rentalId },
      {
        $set: {
          "trips.$[i].rentals.$[x].startDate": startDate,
          "trips.$[i].rentals.$[x].startTime": startTime,
          "trips.$[i].rentals.$[x].startLocation": startLocation,
          "trips.$[i].rentals.$[x].endDate": endDate,
          "trips.$[i].rentals.$[x].endTime": endTime,
          "trips.$[i].rentals.$[x].endLocation": endLocation,
          "trips.$[i].rentals.$[x].name": name,
          "trips.$[i].rentals.$[x].confirmationNo": confirmationNo,
          "trips.$[i].rentals.$[x].vehicleType": vehicleType,
        },
      },
      {
        arrayFilters: [
          { "i.rentals._id": req.params.rentalId },
          { "x._id": req.params.rentalId },
        ],
        new: true,
      }
    )
      .then((rental) => {
        if (!rental)
          return res.status(404).json({ message: "Error: Rental not found" });
        rental
          .save()
          .then((user) => {
            let updatedRental;

            user.trips.forEach((trip) => {
              trip.rentals.forEach((rental) => {
                if (rental._id.toString() === req.params.rentalId) {
                  updatedRental = rental;
                  return;
                }
              });
            });

            res.status(200).json({
              message: "Success: Rental update saved successfully",
              updatedRental,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /rentals/${req.params._id}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { rentalId } = req.params;

      let rentalIndex;
      let tripIndex;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.rentals.forEach((rental, index) => {
          if (rental._id.toString() === rentalId.toString()) {
            tripIndex = userTripsIndex;
            rentalIndex = index;
            return;
          }
        });
      });

      if (rentalIndex === -1) {
        return res.status(404).json({ message: "Rental not found" });
      } else {
        req.user.trips[tripIndex].rentals.splice(rentalIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedRental = user.trips[tripIndex].rentals[rentalIndex];
          res.status(200).json(deletedRental);
        });
      }
    }
  });

//Error handling middleware

rentalRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = rentalRouter;
