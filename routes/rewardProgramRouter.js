const express = require("express");
const User = require("../models/user");
const authenticate = require("../authenticate");
const cors = require("./cors");

const rewardProgramRouter = express.Router();

// Route for Trip List
rewardProgramRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    User.find()
      .then((trips) => {
        // The res.json line will send the client JSON and end the find function.
        // It also automatically sets the header Content-Type to 'application/json'
        res.status(200).json(trips);
      })
      .catch((err) => next(err));
  })
  // The '/rewardPrograms' route is only for viewing reward programs.
  // For the rest of the requests we will return status code 403 ('Forbidden')
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /rewardPrograms");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /rewardPrograms");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /rewardPrograms");
  });

// Route for the Add Trip
rewardProgramRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  // The '/rewardPrograms/add' route is only for adding new reward programs.
  // All requests except POST will return status code 403 ('Forbidden')
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /rewardPrograms/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { programName, membershipId } = req.body;
    const newRewardProgram = { programName, membershipId };
    if (!req.user) {
      // Only logged in users can send a 'POST' request.
      // If the request doesn't have a logged in user we will send a 401 ('Unauthorized')
      return res.status(401).json({ message: "Unauthorized: User not found" });
    } else {
      req.user.rewardPrograms.push(newRewardProgram);
      req.user
        .save()
        .then((user) => {
          // Status code 201 is "Created". Its more descriptive than just sending 200 ("OK").
          res
            .status(201)
            .json(user.rewardPrograms[user.rewardPrograms.length - 1]);
        })
        .catch((err) => next(err));
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /rewardPrograms/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send("DELETE operation not supported on /rewardPrograms/add");
  });

// Route for Update Trip
rewardProgramRouter
  .route("/:programId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /trips/${req.params.tripId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /trips/${req.params.tripId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      User.findOneAndUpdate(
        { "trips._id": req.params.tripId },
        {
          $set: {
            "trips.$.tripName": req.body.tripName,
            "trips.$.departureDate": req.body.departureDate,
          },
        },
        { new: true }
      )
        .then((user) => {
          const updatedTrip = user.trips.find(
            (trip) => trip._id.toString() === req.params.tripId
          );
          res.status(200).json(updatedTrip);
        })
        .catch((err) => next(err));
    }
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const programIndex = req.user.rewardPrograms.findIndex(
        (program) => program._id.toString() === req.params.programId
      );

      if (programIndex === -1) {
        return res.status(404).json({ message: "Reward Program not found" });
      } else {
        req.user.rewardPrograms.splice(programIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedProgram = user.rewardPrograms[programIndex];
          res.status(200).json(deletedProgram);
        });
      }
    }
  });

//Error handling middleware

rewardProgramRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = rewardProgramRouter;
