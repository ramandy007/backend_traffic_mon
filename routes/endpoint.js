var express = require("express");
var router = express.Router();
var mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwertyuiop123!@#",
  database: "TrafficMon"
});
connection.connect(function(err) {
  err
    ? console.log(err + "+++++++++++++++//////////")
    : console.log("connection******** successful");
});

router.get("/", function(req, res, next) {
  //   res.send("respond with a the users");

  connection.query("Select * from UserLogin", function(error, results, fields) {
    if (error) res.send("query is received but no db connection");
    //console.log('results',results);
    res.send(JSON.stringify(results));
  });
});

module.exports = router;
