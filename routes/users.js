const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({error: "Email already exists"});
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      newUser.save()
        .then(user => {
          res.redirect('/dashboard');
          return res.json(user);
        })
        .catch(err => {
          return res.status(400).json({error: err});
        });
    }
  });
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    if (user) {
      if (password === user.password) {
        res.redirect('/dashboard');
        return res.json(user);
      } else {
        return res.status(404).json({error: "incorrect password"});
      }
    } else {
      return res.status(404).json({error: "User not found"});
    }
  });
});

module.exports = router;