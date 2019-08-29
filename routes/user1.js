var express = require("express");
var router = express.Router();
var cors = require("cors");
var mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwertyuiop123!@#",
  database: "TrafficMon_import"
});
var userData = {};
var loginData = {};

connection.connect(function(err) {
  err
    ? console.log(err + "+++++++++++++++//////////")
    : console.log("connection2******** successful");
});

connection.connect(function() {});

router.get("/register", (req, res) => {
  connection.query("select * from logint;", function(err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));

    console.log("The solution is: ", rows[0].solution);
  });
});

router.post("/register", (req, res) => {
  userData = {
    user_name: req.body.name,

    user_address: req.body.user_address,
    licence_no: req.body.licence_no,
    user_permission: req.body.user_permission
  };
  var loginData = {
    login_username: req.body.user_name,
    user_password: req.body.password,
    pass_hash: "",
    user_id: null
  };

  // bcrypt.hash(req.body.password, 10, (err, hash) => {

  // });

  // var insert_userquery = `insert into usert (user_name,user_address,licence_no,user_permission) values('${userData.user_name}' ,'${userData.user_address}' , '${userData.licence_no}','${userData.userpermission}');`;

  var insert_userquery = "INSERT INTO usert set   ?";

  connection.query(insert_userquery, userData, function(err, result) {
    if (err) console.log(err);
    {
      loginData.user_id = result.insertId;

      console.log(result.insertId);
      console.log("\nInsertion sucess");
    }
  });

  var insert_loginquery = "Insert into logint set ?";
  connection.query(insert_loginquery, loginData, function(err, result) {
    if (err) console.log(err);
    {
      console.log("\nInsertion sucess");
    }
  });
});

module.exports = router;
