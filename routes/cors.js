const cors = require("cors");

const whitelist = [
  "http://localhost:3000",
  "https://journiserver.onrender.com",
  "https://journitravel.netlify.app",
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (process.env.NODE_ENV === "development") {
    // Allow all origins during development
    corsOptions = { origin: true };
  } else {
    if (whitelist.indexOf(req.header("Origin")) !== -1) {
      corsOptions = { origin: true };
    } else {
      corsOptions = { origin: false };
    }
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
