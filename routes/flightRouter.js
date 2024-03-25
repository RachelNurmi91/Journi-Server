// const express = require('express');
// const Flight = require('../models/flight')

// const flightRouter = express.Router()

// // Route for Flight List
// flightRouter.route('/')
// .get((req, res, next) => {
//     Flight.find()
//     .then(flights => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         // res.json will send the client json and end find
//         res.json(flights)
//     })
//     .catch(err => next(err))
// })


// // Route for the Add Flight
// flightRouter.route('/add')
// .post((req, res, next) => {
//     Flight.create(req.body)
//     .then(flight => {
//         console.log('Flight Reservation created.')
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(flight)
//     })
//     .catch(err => next(err))
// })

// // Route for Update Flight
// flightRouter.route('/:flightId')
// .put((req, res, next) => {
//     Flight.findByIdAndUpdate(req.params.flightId, {
//         $set: req.body
//     }, { new: true })
//     .then(flight => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(flight);
//     })
//     .catch(err => next(err));
// })
// .delete((req, res, next) => {
//     Flight.findByIdAndDelete(req.params.flightId)
//     .then(flight => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(flight);
//     })
//     .catch(err => next(err));
// })

// module.exports = flightRouter;