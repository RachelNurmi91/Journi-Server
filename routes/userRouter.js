const express = require("express");
const passport = require("passport");
const authenticate = require("../authenticate");
const User = require("../models/user");
const cors = require("./cors");

const userRouter = express.Router();

/* GET users listing. */
userRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.status(403).send("GET operation not supported on /users");
  });

userRouter
  .route("/:username")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    User.find()
      .then((users) => {
        let user = users.find((user) => user.username === req.params.username);
        return res.status(200).json(user);
      })
      .catch((err) => next(err));
  });

userRouter
  .route("/register")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .post(cors.corsWithOptions, (req, res) => {
    const { username, firstName, lastName, password } = req.body;
    User.register(
      { username, firstName, lastName },
      password,
      (err, newUser) => {
        if (err) {
          // Status code 500 is 'internal server error'.
          return res.status(500).json({ err: err });
        } else {
          if (req.body.firstName) {
            newUser.firstName = req.body.firstName;
          }
          if (req.body.lastName) {
            newUser.lastName = req.body.lastName;
          }

          newUser.save((err) => {
            if (err) {
              return res.status(500).json({ err: err });
            } else {
              passport.authenticate("local")(req, res, () => {
                return res.status(200).json({
                  success: true,
                  status: "Your registration was successful!",
                });
              });
            }
          });
        }
      }
    );
  });

userRouter
  .route("/login")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, passport.authenticate("local"), (req, res) => {
    // We will pass the id to getToken in authenticate.js and the return result will be our token.

    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, token: token, status: "Login was successful!" });
  });

module.exports = userRouter;
