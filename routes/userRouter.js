const express = require("express");
const passport = require("passport");
const authenticate = require("../authenticate");
const User = require("../models/user");

const userRouter = express.Router();

/* GET users listing. */
userRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;
  User.register(
    { username, firstName, lastName, email },
    password,
    (err, newUser) => {
      if (err) {
        console.log("Error: ", err);
        // Status code 500 is 'internal server error'.
        return res.status(500).json({ err: err });
      } else {
        if (req.body.firstName) {
          newUser.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          newUser.lastName = req.body.lastName;
        }
        if (req.body.email) {
          newUser.email = req.body.email;
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

userRouter.post("/login", passport.authenticate("local"), (req, res) => {
  // We will pass the id to getToken in authenticate.js and the return result will be our token.
  console.log(req.user);
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, token: token, status: "Login was successful!" });
});

module.exports = userRouter;
