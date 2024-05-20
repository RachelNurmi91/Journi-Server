const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const noteRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S HOTEL LIST ---- //
noteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    // Hotels are trip based, not user based.
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

        res.status(200).json(trip.notes);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /notes");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /notes");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /notes");
  });

// ---- ROUTE FOR ADDING A HOTEL TO A TRIP ---- //
noteRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /notes/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a note the request body must contain a the id of the trip it will be added to.
    const { note, tripId } = req.body;

    const newNote = {
      note,
    };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.notes.push(newNote);

      user
        .save()
        .then((user) => {
          const newNote = user.trips.id(tripId).notes.slice(-1);
          res.status(200).json({
            message: "Success: Hotel saved successfully",
            newNote,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /notes/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /notes/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL HOTEL ---- //
noteRouter
  .route("/:noteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the noteId will be in the url of the req.
  // Since we are focused on the individual note we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /notes/${req.params.noteId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { note } = req.body;
    User.findOneAndUpdate(
      { "trips.notes._id": req.params.noteId },
      {
        $set: {
          "trips.$[i].notes.$[x].note": note,
        },
      },
      {
        arrayFilters: [
          { "i.notes._id": req.params.noteId },
          { "x._id": req.params.noteId },
        ],
        new: true,
      }
    )
      .then((note) => {
        if (!note)
          return res.status(404).json({ message: "Error: Hotel not found" });
        note
          .save()
          .then((user) => {
            let updatedHotel;

            user.trips.forEach((trip) => {
              trip.notes.forEach((note) => {
                if (note._id.toString() === req.params.noteId) {
                  updatedHotel = note;
                  return;
                }
              });
            });

            res.status(200).json({
              message: "Success: Hotel update saved successfully",
              updatedHotel,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /notes/${req.params._id}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { noteId } = req.params;

      let noteIndex;
      let tripIndex;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.notes.forEach((note, index) => {
          if (note._id.toString() === noteId.toString()) {
            tripIndex = userTripsIndex;
            noteIndex = index;
            return;
          }
        });
      });

      if (noteIndex === -1) {
        return res.status(404).json({ message: "Hotel not found" });
      } else {
        req.user.trips[tripIndex].notes.splice(noteIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          const deletedHotel = user.trips[tripIndex].notes[noteIndex];
          res.status(200).json(deletedHotel);
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
