const express = require("express");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const hotelRouter = express.Router();

// ---- ROUTE FOR OBTAINING A TRIP'S HOTEL LIST ---- //
hotelRouter
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

        res.status(200).json(trip.hotels);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("POST operation not supported on /hotels");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /hotels");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /hotels");
  });

// ---- ROUTE FOR ADDING A HOTEL TO A TRIP ---- //
hotelRouter
  .route("/add")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /hotels/add");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // To add a hotel the request body must contain a the id of the trip it will be added to.
    const {
      startDate,
      endDate,
      nameOnReservation,
      name,
      city,
      country,
      confirmationNo,
      tripId,
    } = req.body;

    const newHotel = {
      startDate,
      endDate,
      nameOnReservation,
      name,
      city,
      country,
      confirmationNo,
    };

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
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /hotels/add");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("DELETE operation not supported on /hotels/add");
  });

// ---- ROUTE FOR AN INDIVIDUAL HOTEL ---- //
hotelRouter
  .route("/:hotelId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  // At this point the hotelId will be in the url of the req.
  // Since we are focused on the individual hotel we do not need the tripId sent over in the req body.

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`GET operation not supported on /hotels/${req.params.hotelId}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const {
      name,
      startDate,
      endDate,
      city,
      country,
      nameOnReservation,
      confirmationNo,
    } = req.body;
    User.findOneAndUpdate(
      { "trips.hotels._id": req.params.hotelId },
      {
        $set: {
          "trips.$[i].hotels.$[x].startDate": startDate,
          "trips.$[i].hotels.$[x].endDate": endDate,
          "trips.$[i].hotels.$[x].name": name,
          "trips.$[i].hotels.$[x].city": city,
          "trips.$[i].hotels.$[x].country": country,
          "trips.$[i].hotels.$[x].nameOnReservation": nameOnReservation,
          "trips.$[i].hotels.$[x].confirmationNo": confirmationNo,
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
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res
      .status(403)
      .send(`POST operation not supported on /hotels/${req.params._id}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    } else {
      const { hotelId } = req.params;

      let hotelFound = false;
      let hotelIndex = -1;
      let tripIndex = -1;

      req.user.trips.forEach((trip, userTripsIndex) => {
        trip.hotels.forEach((hotel, index) => {
          if (hotel._id.toString() === hotelId.toString()) {
            tripIndex = userTripsIndex;
            hotelIndex = index;
            hotelFound = true;
          }
        });
      });

      if (!hotelFound) {
        return res.status(404).json({ message: "Hotel not found" });
      } else {
        const deletedHotel = req.user.trips[tripIndex].hotels[hotelIndex];
        req.user.trips[tripIndex].hotels.splice(hotelIndex, 1);
        req.user.save((err, user) => {
          if (err) {
            return next(err);
          }
          res.status(200).json(deletedHotel);
        });
      }
    }
  });

//Error handling middleware

hotelRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("An internal server error has occurred.");
});

module.exports = hotelRouter;
