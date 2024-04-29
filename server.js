var createError = require("http-errors");
var express = require("express");
var path = require("path");
const logger = require("morgan");
const passport = require("passport");
const config = require("./config");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/userRouter");
const tripRouter = require("./routes/tripRouter");
const flightRouter = require("./routes/flightRouter");
const hotelRouter = require("./routes/hotelRouter");
const rewardProgramRouter = require("./routes/rewardProgramRouter");

// const mongoose = require("mongoose");

const { MongoClient } = require("mongodb");

const uri = config.mongoUrl;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// const connect = mongoose.connect(url, {
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

client.connect().then(
  () => console.log("Connected correctly to server"),
  (err) => console.error(err)
);

//The express() method returns an express server application
const app = express();
const PORT = process.env.PORT || 8080;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//Configures Morgan to log using the dev version
app.use(logger("dev"));

//This middleware will parse JSON data of the request obj.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", userRouter);

//Allows Morgan to serve files from the public folder.
//__dirname is a Node variable that refers to the absolute path of the directory of the file its in.
app.use(express.static(__dirname + "/public"));

// Routes here require login.
app.use("/trips", tripRouter);
app.use("/flights", flightRouter);
app.use("/hotels", hotelRouter);
app.use("/rewardPrograms", rewardProgramRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, console.log(`Server is running at ${PORT}`));

module.exports = app;
