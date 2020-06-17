const mongoose = require('mongoose');
const User = require('./models/Users');
const express = require('express');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/login', () =>
  console.log('connected to the database')
);
const port = process.env.PORT || 4411;

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const newUser = new User();
  newUser.email = email;
  newUser.password = password;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) return err;
      newUser.password = hash;
      newUser
        .save()
        .then((saveUser) => {
          res.status(200).json(newUser);
        })
        .catch((err) => {
          res.status(400).json({ message: `User was not saved because`, err });
        });
    });
  });
});

app.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, matched) => {
          if (err) {
            return err;
          }
          if (matched) {
            res.status(200).json({ message: 'Login was successful' });
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).json({ message: 'Login was not successful' });
    });
});

app.listen(port, console.log(`server running at port ${port}`));
