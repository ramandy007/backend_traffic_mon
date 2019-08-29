var express = require("express");
var router = express.Router();
var mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwertyuiop123!@#",
  database: "TrafficMon_import"
});
connection.connect(function(err) {
  err
    ? console.log(err + "+++++++++++++++//////////")
    : console.log("connection******** successful");
});

router.get("/users", function(req, res, next) {
  //   res.send("respond with a the users");

  connection.query("select * from usert", function(error, results, fields) {
    if (error) res.send("query is received but no db connection");
    //console.log('results',results);
    res.send(JSON.stringify(results));
  });
});

router.get("/login", function(req, res, next) {
  //   res.send("respond with a the users");

  connection.query("select * from logint", function(error, results, fields) {
    if (error) res.send("query is received but no db connection");
    //console.log('results',results);
    res.send(JSON.stringify(results));
  });
});

module.exports = router;
