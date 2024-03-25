const express = require('express');
const passport = require('passport');
const authenticate = require('../authenticate');
const User = require('../models/user');

const userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username}),
    req.body.password,
    (err, newUser) => {
      if (err) {
        console.log('Error: ', err)
        // Status code 500 is 'interal server error'.
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err})
      } else {
        if (req.body.firstname) {
          newUser.firstName = req.body.firstname;
        }
        if (req.body.lastname) {
          newUser.lastName = req.body.lastname;
        }
        if (req.body.email) {
          newUser.email = req.body.email;
        }
        newUser.save(err => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        })
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration was successful!'});
        });
      }
    }
  )
});

userRouter.post('/login', passport.authenticate('local'), (req, res) => {
  // We will pass the id to getToken in authenticate.js and the return result will be our token.
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'Login was successful!'});
});

module.exports = userRouter;
