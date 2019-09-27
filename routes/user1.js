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
router.get("/users", (req, res) => {

  //  get request tolists all entries in logint table of database
  connection.query("select * from usert;", function (err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));

    console.log("The solution is: ", rows[0]);
  });
});

router.get("/login", (req, res) => {

  //  get request tolists all entries in logint table of database
  connection.query("select * from logint;", function (err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows));

    console.log("The solution is: ", rows[0]);
  });
});

var loginData = {};

router.post("/register", (req, res) => {
  // if a post request with details in body to this route the query is executed

  var userData = {
    user_name: req.body.name,

    user_address: req.body.user_address,
    licence_no: req.body.licence_no,
    user_permission: req.body.user_permission
  };
  loginData = {
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
      console.log("from user insetrion", loginData)
      // console.log(result);
      // console.log("\nInsertion sucess");
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) console.log(err);
        loginData.pass_hash = hash;
        var insert_loginquery = "Insert into logint set ?";
        console.log(loginData);

        connection.query(insert_loginquery, loginData, function (err, result) {
          if (err) console.log(err);
          {
            console.log(result);
            console.log("\nInsertion sucess");
            res.send(result);
          }
        });
      });
    }
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
        connection.promise().query("select user_permission from usert where user_id =?", [results[0].user_id]).then(([rows, fields]) => {
          console.log(rows[0].user_permission);
          console.log("before token creation");
          if (bcrypt.compareSync(user_password, results[0].pass_hash)) {
            let token = jwt.sign({ id: results[0].user_id, username: login_username, user_permission: rows[0].user_permission }, 'you cant guess it guys!!!', { expiresIn: 129600 });
            console.log("ater token creatioon")
            res.json({
              "code": 200,
              "success": "login successful",
              token: token
            });
            // return Promise.resolve(res);
          }
          else {
            res.send({
              "code": 204,
              "success": "username and password doesnt match"
            });
          }
        }).catch(console.log)

      } else {
        res.send({
          "code": 204,
          "success": "username doesnt exist"
        });
      }


    }
  });






});

router.post("/editusers", (req, res) => {
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

  };

  var update_userquery = 'update usert set   ? where user_id= ? ';

  connection.query(update_userquery, [userData, req.body.user_id], async function (err, result) {

    console.log(update_userquery);
    if (err) console.log(err);
    {
      loginData.user_id = await result.insertId;
      console.log("from user updation", loginData)
      // console.log(result);
      // console.log("\nInsertion sucess");
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) console.log(err);
        loginData.pass_hash = hash;
        var update_loginquery = "update  logint set ? where user_id=?";
        console.log(loginData);

        connection.query(update_loginquery, [loginData, req.body.user_id], function (err, result) {
          if (err) console.log(err);
          {
            console.log(result);
            console.log("\n updation  sucess");
            res.send(result);
          }
        });
      });
    }
  });





});


router.post("/vehicles", (req, res) => {

  var data = {
    plate_no: req.body.plate_no,
    vehicle_type: req.body.vehicle_type,
    manufacture: req.body.manufacture,
    user_id: req.body.user_id
  }

  var query = "insert into vehiclet  set ? ";

  connection.query(query, data, (err, results) => {
    console.log(query);

    if (err) res.send(err);

    else {
      console.log(results);
      console.log("vehicle insertion success");
      res.send(" vehicle insertion success");
    }


  });

});

router.get("/vehicle_info", (req, res) => {

  var plate_no = req.query.plate_no;
  var query = `select * from vehiclet where plate_no = '${plate_no}'`;
  console.log(plate_no, query);
  connection.query(query, (err, result) => {
    console.log("query processed ");
    var op = result;
    if (result.length != 0) {
      var uid = op[0].user_id;
      var query = `select * from usert where user_id ='${uid}'`;
      connection.query(query, async (err, result) => {
        var userdetails = await result;
        for (x of userdetails) {
          console.log(x);
          op.push(x);
        }
        res.send(op);
      });

      console.log('\n\n', uid);
    }
    else (res.send(null))



  });



});


module.exports = router;

// insert into tablename set ?  => is used to match the entries via key name and enter into database
