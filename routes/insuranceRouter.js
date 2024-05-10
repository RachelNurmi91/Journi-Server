const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const insuranceRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S CRUISE LIST ---- //
insuranceRouter
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

        res.status(200).json(trip.insurance);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /insurance");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /insurance");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /insurance");
  });

// ---- ROUTE FOR ADDING A CRUISE TO A TRIP ---- //
insuranceRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /insurance/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a insurance the request body must contain a the id of the trip it will be added to.
    const { insuranceProvider, policyNo, comments, tripId } = req.body;

    const newInsurance = {
      insuranceProvider,
      policyNo,
      comments,
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.insurance.push(newInsurance);

      user
        .save()
        .then((user) => {
          const newInsurance = user.trips.id(tripId).insurance.slice(-1);
          res.status(200).json({
            message: "Success: Insurance saved successfully",
            newInsurance,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /insurance/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /insurance/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL CRUISE ---- //
insuranceRouter
  .route("/:insuranceId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the insuranceId will be in the url of the req.
  // Since we are focused on the individual insurance we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(
        `GET operation not supported on /insurance/${req.params.insuranceId}`
      );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { insuranceProvider, policyNo, comments } = req.body;
    User.findOneAndUpdate(
      { "trips.insurance._id": req.params.insuranceId },
      {
        $set: {
          "trips.$[i].insurance.$[x].insuranceProvider": insuranceProvider,
          "trips.$[i].insurance.$[x].policyNo": policyNo,
          "trips.$[i].insurance.$[x].comments": comments,
        },
      },
      {
        arrayFilters: [
          { "i.insurance._id": req.params.insuranceId },
          { "x._id": req.params.insuranceId },
        ],
        new: true,
      }
    )
      .then((insurance) => {
        if (!insurance)
          return res
            .status(404)
            .json({ message: "Error: Insurance not found" });
        insurance
          .save()
          .then((user) => {
            let updatedInsurance;

            user.trips.forEach((trip) => {
              trip.insurance.forEach((insurance) => {
                if (insurance._id.toString() === req.params.insuranceId) {
                  updatedInsurance = insurance;
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
      .send(`POST operation not supported on /insurance/${req.params._id}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { insuranceId } = req.params;

      let insuranceIndex;
      let tripIndex;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.insurance.forEach((insurance, index) => {
          if (insurance._id.toString() === insuranceId.toString()) {
            tripIndex = userTripsIndex;
            insuranceIndex = index;
            return;
          }
        });
      });

      if (insuranceIndex === -1) {
        return res.status(404).json({ message: "Insurance not found" });
      } else {
        req.user.trips[tripIndex].insurance.splice(insuranceIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedInsurance =
            user.trips[tripIndex].insurance[insuranceIndex];
          res.status(200).json(deletedInsurance);
        });
      }
    }
  });

//Error handling middleware

insuranceRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = insuranceRouter;
