const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const transportationRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S CRUISE LIST ---- //
transportationRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // Insurance are trip based, not user based.
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

        res.status(200).json(trip.transportation);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /transportation");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /transportation");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /transportation");
  });

// ---- ROUTE FOR ADDING A CRUISE TO A TRIP ---- //
transportationRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /transportation/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a transportation the request body must contain a the id of the trip it will be added to.
    const { startDate, type, tripId } = req.body;
    console.log(req.body);
    const newTransportation = {
      startDate,
      type,
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.transportation.push(newTransportation);

      user
        .save()
        .then((user) => {
          const newTransportation = user.trips
            .id(tripId)
            .transportation.slice(-1);
          res.status(200).json({
            message: "Success: Transportation saved successfully",
            newTransportation: newTransportation,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /transportation/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send("DELETE operation not supported on /transportation/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL CRUISE ---- //
transportationRouter
  .route("/:transportationId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the transportationId will be in the url of the req.
  // Since we are focused on the individual transportation we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(
        `GET operation not supported on /transportation/${req.params.transportationId}`
      );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { name, policyNo, comments } = req.body;
    User.findOneAndUpdate(
      { "trips.transportation._id": req.params.transportationId },
      {
        $set: {
          "trips.$[i].transportation.$[x].name": name,
          "trips.$[i].transportation.$[x].policyNo": policyNo,
          "trips.$[i].transportation.$[x].comments": comments,
        },
      },
      {
        arrayFilters: [
          { "i.transportation._id": req.params.transportationId },
          { "x._id": req.params.transportationId },
        ],
        new: true,
      }
    )
      .then((transportation) => {
        if (!transportation)
          return res
            .status(404)
            .json({ message: "Error: Insurance not found" });
        transportation
          .save()
          .then((user) => {
            let updatedInsurance;

            user.trips.forEach((trip) => {
              trip.transportation.forEach((transportation) => {
                if (
                  transportation._id.toString() === req.params.transportationId
                ) {
                  updatedInsurance = transportation;
                  return;
                }
              });
            });

            res.status(200).json({
              message: "Success: Insurance update saved successfully",
              updatedInsurance,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(
        `POST operation not supported on /transportation/${req.params._id}`
      );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { transportationId } = req.params;

      let transportationIndex;
      let tripIndex;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.transportation.forEach((transportation, index) => {
          if (transportation._id.toString() === transportationId.toString()) {
            tripIndex = userTripsIndex;
            transportationIndex = index;
            return;
          }
        });
      });

      if (transportationIndex === -1) {
        return res.status(404).json({ message: "Insurance not found" });
      } else {
        req.user.trips[tripIndex].transportation.splice(transportationIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedInsurance =
            user.trips[tripIndex].transportation[transportationIndex];
          res.status(200).json(deletedInsurance);
        });
      }
    }
  });

//Error handling middleware

transportationRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = transportationRouter;
