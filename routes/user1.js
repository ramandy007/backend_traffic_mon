var express = require("express");
var router = express.Router();
var cors = require("cors");
var mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const exjwt = require('express-jwt');

const jwtMW = exjwt({
  secret: 'you cant guess it guys!!!'
})

// sql connection via mysql2 package from npm
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwertyuiop123!@#",
  database: "TrafficMon_import"
});


// checking whether connection is successful

connection.connect(function (err) {
  err
    ? console.log(err + "+++++++++++++++//////////")
    : console.log("connection2******** successful");
});

router.get("/register", (req, res) => {

  //  get request tolists all entries in logint table of database
  connection.query("select * from logint;", function (err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));

    console.log("The solution is: ", rows[0]);
  });
});

router.post("/register", (req, res) => {
  // if a post request with details in body to this route the query is executed

  var userData = {
    user_name: req.body.name,

    user_address: req.body.user_address,
    licence_no: req.body.licence_no,
    user_permission: req.body.user_permission
  };
  var loginData = {
    login_username: req.body.user_name,
    user_password: req.body.password,
    pass_hash: "",
    user_id: ""
  };

  var insert_userquery = "INSERT INTO usert set   ?";

  connection.query(insert_userquery, userData, async function (err, result) {
    if (err) console.log(err);
    {
      loginData.user_id = await result.insertId;

      // console.log(result);
      // console.log("\nInsertion sucess");
    }
  });

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) console.log(err);
    // console.log(hash);
    loginData.pass_hash = hash;
    var insert_loginquery = "Insert into logint set ?";
    connection.query(insert_loginquery, loginData, function (err, result) {
      if (err) console.log(err);
      {
        console.log(result);
        console.log("\nInsertion sucess");
        res.send(result);
      }
    });
  });

  // var insert_userquery = `insert into usert (user_name,user_address,licence_no,user_permission) values('${userData.user_name}' ,'${userData.user_address}' , '${userData.licence_no}','${userData.userpermission}');`;
});




router.post("/login", (req, res) => {

  var login_username = req.body.user_name;
  var user_password = req.body.password

  connection.query('select * from logint where login_username =?', [login_username], function (error, results, fields) {
    if (error) {
      console.log(error);
      res.send({
        "code": 400,
        "failed": "error occured",
        "results": results
      })
    }
    else {
      console.log('the solution is:', results);

      if (results.length > 0) {
        if (bcrypt.compareSync(user_password, results[0].pass_hash)) {
          let token = jwt.sign({ id: results[0].user_id, username: login_username }, 'you cant guess it guys!!!', { expiresIn: 129600 });
          res.json({
            "code": 200,
            "success": "login successful",
            token: token
          });
        }
        else {
          res.send({
            "code": 204,
            "success": "username amd password doesnt match"
          });
        }
      } else {
        res.send({
          "code": 204,
          "success": "username doesnt exist"
        });
      }


    }
  });




});

module.exports = router;

// insert into tablename set ?  => is used to match the entries via key name and enter into database
