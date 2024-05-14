const express = require("express");
const User = require("../models/user");
const authenticate = require("../authenticate");
const cors = require("./cors");

const noteRouter = express.Router();

// Route for Trip List
noteRouter
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
  // The '/notes' route is only for viewing reward programs.
  // For the rest of the requests we will return status code 403 ('Forbidden')
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /notes");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /notes");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /notes");
  });

// Route for the Add Trip
noteRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  // The '/notes/add' route is only for adding new reward programs.
  // All requests except POST will return status code 403 ('Forbidden')
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /notes/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { note } = req.body;
    const newNote = { note };
    if (!req.user) {
      // Only logged in users can send a 'POST' request.
      // If the request doesn't have a logged in user we will send a 401 ('Unauthorized')
      return res.status(401).json({ message: "Unauthorized: User not found" });
    } else {
      req.user.notes.push(newNote);
      req.user
        .save()
        .then((user) => {
          // Status code 201 is "Created". Its more descriptive than just sending 200 ("OK").
          res.status(201).json(user.notes[user.notes.length - 1]);
        })
        .catch((err) => next(err));
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /notes/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /notes/add");
  });

// Route for Update Trip
noteRouter
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
      const programIndex = req.user.notes.findIndex(
        (program) => program._id.toString() === req.params.programId
      );

      if (programIndex === -1) {
        return res.status(404).json({ message: "Reward Program not found" });
      } else {
        req.user.notes.splice(programIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedProgram = user.notes[programIndex];
          res.status(200).json(deletedProgram);
        });
      }
    }
  });

//Error handling middleware

noteRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = noteRouter;
