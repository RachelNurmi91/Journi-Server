// const express = require('express');
// const Trip = require('../models/trip')

// const tripRouter = express.Router()

// // Route for Trip List
// tripRouter.route('/')
// .get((req, res, next) => {
//     Trip.find()
//     .then(trips => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         // res.json will send the client json and end find
//         res.json(trips)
//     })
//     .catch(err => next(err))
// })

// // Route for the Add Trip
// tripRouter.route('/add')
// .post((req, res, next) => {
//     Trip.create(req.body)
//     .then(trip => {
//         console.log('Trip created.')
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(trip)
//     })
//     .catch(err => next(err))
// })

// // Route for Update Trip
// tripRouter.route('/:tripId')
// .put((req, res, next) => {
//     Trip.findByIdAndUpdate(req.params.tripId, {
//         $set: req.body
//     }, { new: true })
//     .then(trip => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(trip);
//     })
//     .catch(err => next(err));
// })
// .delete((req, res, next) => {
//     Trip.findByIdAndDelete(req.params.tripId)
//     .then(trip => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(trip);
//     })
//     .catch(err => next(err));
// })


// module.exports = tripRouter;