const express = require('express');
const Flight = require('../models/flight')

const flightRouter = express.Router()

// Route for Flight List
flightRouter.route('/')
.get((req, res, next) => {
    Flight.find()
    .then(flights => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        // res.json will send the client json and end find
        res.json(flights)
    })
    .catch(err => next(err))
})
.delete((req, res, next) => {
    Flight.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
})

// Route for the Add Flight
flightRouter.route('/flight/add')
.post((req, res, next) => {
    Flight.create(req.body)
    .then(flight => {
        console.log('Flight Reservation created.')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(flight)
    })
    .catch(err => next(err))
})

// Route for Update Flight
flightRouter.route('/flight/update/:flightId')
.put((req, res, next) => {
    Flight.findById(req.params.flightId)
    .then(flight => {
        if(flight && flight.id(req.params.flightId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(flight.id(req.params.flightId));
        } else if (!flight) {
            err = new Error(`Comment ${req.params.flightId} not found`);
            err.status = 404;
            return next(err)
        } else {
            err = new Error(`Flight ${req.params.flightId} not found`);
            err.status = 404;
            return next(err)
        }
    })
    .catch(err => next(err))
})

module.exports = flightRouter;