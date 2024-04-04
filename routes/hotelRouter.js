const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");

const hotelRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S HOTEL LIST ---- //
hotelRouter
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
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

        res.status(200).json(trip.hotels);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /hotels");
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /hotels");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /hotels");
  });

// ---- ROUTE FOR ADDING A HOTEL TO A TRIP ---- //
hotelRouter
  .route("/add")
  .get(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /hotels/add");
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    // To add a hotel the request body must contain a the id of the trip it will be added to.

    const { type, airline, ticketHolder, tripId } = req.body;
    const newHotel = { type, airline, ticketHolder };

    User.findById(req.user._id).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ message: "Unauthorized: User not found" });

      const trip = user.trips.id(tripId);
      if (!trip)
        return res.status(404).json({ message: "Error: Trip not found" });

      trip.hotels.push(newHotel);

      user
        .save()
        .then((user) => {
          const newHotel = user.trips.id(tripId).hotels.slice(-1);
          res.status(200).json({
            message: "Success: Hotel saved successfully",
            newHotel,
          });
        })
        .catch((err) => next(err));
    });
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /hotels/add");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /hotels/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL HOTEL ---- //
hotelRouter
  .route("/:hotelId")

  // At this point the hotelId will be in the url of the req.
  // Since we are focused on the individual hotel we do not need the tripId sent over in the req body.

  .get(authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /hotels/${req.params.hotelId}`);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    const { type, airline, ticketHolder } = req.body;
    User.findOneAndUpdate(
      { "trips.hotels._id": req.params.hotelId },
      {
        $set: {
          "trips.$[i].hotels.$[x].type": type,
          "trips.$[i].hotels.$[x].airline": airline,
          "trips.$[i].hotels.$[x].ticketHolder": ticketHolder,
        },
      },
      {
        arrayFilters: [
          { "i.hotels._id": req.params.hotelId },
          { "x._id": req.params.hotelId },
        ],
        new: true,
      }
    )
      .then((hotel) => {
        if (!hotel)
          return res.status(404).json({ message: "Error: Hotel not found" });
        hotel
          .save()
          .then((user) => {
            let updatedHotel;

            user.trips.forEach((trip) => {
              trip.hotels.forEach((hotel) => {
                if (hotel._id.toString() === req.params.hotelId) {
                  updatedHotel = hotel;
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
  .post(authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /hotels/${req.params.hotelId}`);
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user)
          return res
            .status(404)
            .json({ message: "Unauthorized: User not found" });

        const tripIndex = user.trips.findIndex((trip) => {
          return trip.hotels.some(
            (hotel) => hotel._id.toString() === req.params.hotelId
          );
        });

        if (tripIndex === -1)
          return res.status(404).json({ message: "Error: Hotel not found" });

        user.trips[tripIndex].hotels = user.trips[tripIndex].hotels.filter(
          (hotel) => hotel._id.toString() !== req.params.hotelId
        );

        user
          .save()
          .then((user) => {
            let updatedTrip = user.trips[tripIndex];

            res.status(200).json({
              message: "Success: Hotel deleted successfully",
              updatedTrip,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

//Error handling middleware

hotelRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = hotelRouter;
