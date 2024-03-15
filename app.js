var express = require('express');
const morgan = require('morgan')
const hotelRouter = require('./routes/hotelRouter');
const flightRouter = require('./routes/flightRouter');
const tripRouter = require('./routes/tripRouter');

const hostname = 'localhost';
const port = '3000';

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/journi';

const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

//The express() method returns an express server application
const app = express();

//Configures Morgan to log using the dev version
app.use(morgan('dev'));

//This middleware will parse JSON data of the request obj.
app.use(express.json());

app.use('/hotels', hotelRouter);
app.use('/flights', flightRouter);
app.use('/trips', tripRouter);

//Allows Morgan to serve files from the public folder.
//__dirname is a Node variable that refers to the absolute path of the directory of the file its in.
app.use(express.static(__dirname + '/public'));


//The use() method sets up the server to return a request
app.use((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>')
})


//Listen allows us to listen for requests
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

module.exports = app;
