const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post(
  "/register",
  [
    //* Adding Validations using express-validator
    body("name", "Enter a Valid name.").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must have atleast 5 charecters.").isLength({
      min: 5,
    }),
    body("college", "College is a required field.").exists(),
  ],
  async (req, res) => {
    try {
      //* check errors and send Bad requests
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0] });
      }
      //* Check if a User with the same email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          errors:
            "A user with the given email alredy exists.Please login to continue.",
        });
      }
      //* Hashing and Salting Password
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        //* Create and save a User in the DB
        if (!err) {
          user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            college: req.body.college,
          });
          //* Send JWt Authentication Token
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, JWT_SECRET);

          res.json({ authToken });
        }
      });
    } catch (error) {
      //* Send Internal Server Error
      console.error(error.message);
      res.status(500).json({ errors: "Some error occured" });
    }
  }
);

//* Login a User using POST: '/api/auth/login'
router.post(
  "/login",
  [
    //* Adding Validations using express-validator
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //* check errors and send Bad requests
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0] });
    }
    const { email, password } = req.body;
    try {
      //* Search for the user and Authenticate
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: "Email address or Password is incorrect" });
      }
      bcrypt.compare(password, user.password).then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ errors: "Email address or Password is incorrect" });
        }
        //* Send JWt Authentication Token
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken });
      });
    } catch (error) {
      //* Send Internal Server Error
      console.error(error.message);
      res.status(500).json({ errors: "Some error occured" });
    }
  }
);

//* Get a Your Info using POST: '/api/auth/info'
router.get("/info", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (error) {
    //* Send Internal Server Error
    console.error(error.message);
    res.status(500).json({ errors: "Some error occured" });
  }
});

//* Get a User Info using POST: '/api/auth/user-info'
router.get("/info", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (error) {
    //* Send Internal Server Error
    console.error(error.message);
    res.status(500).json({ errors: "Some error occured" });
  }
});

module.exports = router;
