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
const sequelize = new Sequelize(
  "TrafficMon_import",
  "root",
  "qwertyuiop123!@#",
  {
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
  }
);

db.sequelize = sequelize;
//console.log(db);

const Login_input = db.sequelize.define(
  "logint",
  {
    user_id: { type: Sequelize.INTEGER },
    login_username: { type: Sequelize.STRING },
    user_password: { type: Sequelize.STRING },
    pass_hash: { type: Sequelize.STRING }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

const User = db.sequelize.define(
  "usert",
  {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },

    user_name: { type: Sequelize.STRING },
    user_address: {
      type: Sequelize.STRING
    },
    licence_no: {
      type: Sequelize.INTEGER
    },
    user_permission: {
      type: Sequelize.SMALLINT
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
  // res.send(req.body);
  const userData = {
    user_name: req.body.name,
    password: req.body.password,
    user_address: req.body.user_address,
    licence_no: req.body.licence_no,
    user_permission: req.body.user_permission
  };
  const loginData = {
    login_username: req.body.user_name,
    user_password: req.body.password,
    pass_hash: ""
  };

  console.log(loginData + "\n" + userData);

  Login_input.findOne({
    where: {
      login_username: req.body.user_name
    }
  })
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          loginData.pass_hash = hash;
          User.create(userData)
            .then(user => {
              res.json({ status: user.email + " registered" });
            })
            .catch(err => {
              res.send("error" + err);
            });
          Login_input.create(loginData)
            .then(user => {
              res.json({ status: user.login_username + " registered" });
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

  // res.send(userData);

  User.findOne({
    where: {
      user_name: req.body.user_name
    }
  });
  // .then(user => {
  //   if (!user) {
  //     bcrypt.hash(req.body.password, 10, (err, hash) => {
  //       userData.pass_hash = hash;
  //     });
  //   } else {
  //     res.status(400).json({ error: "User already exists" });
  //   }
  // })
  // .catch(err => {
  //   res.send("error:" + err);
  // });
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
