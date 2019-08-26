var express = require("express");
var router = express.Router();
var cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const validateLoginInput = require("./validator/login");
// const validateRegisterInput = require("./validator/register");
//sequelize is an middleware between express and mysql server

const Sequelize = require("sequelize");

process.env.SECRET_KEY = "secret";

const db = {};
const sequelize = new Sequelize("TrafficMon", "root", "qwertyuiop123!@#", {
  host: "localhost",
  dialect: "mysql",
  operatorAliases: false,
  freezeTableName: true,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

db.sequelize = sequelize;
//console.log(db);

const User = db.sequelize.define(
  "UserLogin",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // first_name:{type:Sequelize.STRING},
    // last_name:{type:Sequelize.STRING},
    email: { type: Sequelize.STRING },
    password: {
      type: Sequelize.STRING
    }

    // created: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    // modified: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

router.use(cors());

router.post("/register", (req, res) => {
  // router.post('/register',(req,res)=>{

  // const { errors,isValid }=validateRegisterInput(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  const today = new Date();
  const userData = {
    // first_name:req.body.first_name,
    // last_name:req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    created: today,
    modified: today
  };

  // res.send(userData);
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          User.create(userData)
            .then(user => {
              res.json({ status: user.email + " registered" });
            })
            .catch(err => {
              res.send("error" + err);
            });
        });
      } else {
        res.status(400).json({ error: "User already exists" });
      }
    })
    .catch(err => {
      res.send("error:" + err);
    });
});

router.post("/login", (req, res) => {
  // const { errors, isValid } = validateLoginInput(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
            expiresIn: 1440
          });
          res.send(token);
        }
      } else {
        res.status(400).json({ error: "user doesnt exist" });
      }
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
