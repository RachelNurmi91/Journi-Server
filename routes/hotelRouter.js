// const express = require('express');
// const Hotel = require('../models/hotel')

// const hotelRouter = express.Router()

// // Route for Hotel List
// hotelRouter.route('/')
// .get((req, res, next) => {
//     Hotel.find()
//     .then(hotels => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         // res.json will send the client json and end find
//         res.json(hotels)
//     })
//     .catch(err => next(err))
// })
// .delete((req, res, next) => {
//     Hotel.deleteMany()
//     .then(response => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(response);
//     })
//     .catch(err => next(err));
// })

// // Route for the Add Hotel
// hotelRouter.route('/add')
// .post((req, res, next) => {
//     Hotel.create(req.body)
//     .then(hotel => {
//         console.log('Hotel Reservation created.')
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(hotel)
//     })
//     .catch(err => next(err))
// })

// // Route for Update Hotel
// hotelRouter.route('/hotel/update/:hotelId')
// .put((req, res, next) => {
//     Hotel.findByIdAndUpdate(req.params.hotelId, {
//         $set: req.body
//     }, { new: true })
//     .then(hotel => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(hotel);
//     })
//     .catch(err => next(err));
// })
// .delete((req, res, next) => {
//     Hotel.findByIdAndDelete(req.params.hotelId)
//     .then(hotel => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(hotel);
//     })
//     .catch(err => next(err));
// })

// module.exports = hotelRouter;
