// Dependencies
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");
const config = require("./config");
const mongoose = require("mongoose");

// MongoDB connection URI
const uri = config.mongoUrl;

// Mongoose connection
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Express App
const app = express();
const PORT = process.env.PORT || 8080;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Morgan logger middleware
app.use(logger("dev"));

// JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport middleware
app.use(passport.initialize());

// Routes
const indexRouter = require("./routes/index");
const userRouter = require("./routes/userRouter");
const tripRouter = require("./routes/tripRouter");
const flightRouter = require("./routes/flightRouter");
const hotelRouter = require("./routes/hotelRouter");
const cruiseRouter = require("./routes/cruiseRouter");
const insuranceRouter = require("./routes/insuranceRouter");
const activityRouter = require("./routes/activityRouter");
const rewardProgramRouter = require("./routes/rewardProgramRouter");

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Mounting routers
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/trips", tripRouter);
app.use("/flights", flightRouter);
app.use("/hotels", hotelRouter);
app.use("/cruises", cruiseRouter);
app.use("/insurance", insuranceRouter);
app.use("/activities", activityRouter);
app.use("/rewardPrograms", rewardProgramRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Start the server
app.listen(PORT, console.log(`Server is running at ${PORT}`));

module.exports = app;
