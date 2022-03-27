const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const Product = require("../models/Product");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const multer = require("multer");

// Storage staratagy for multer
const storageStrategy = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      const extension = file.mimetype.slice(6, file.mimetype.length);
      cb(null, uniqueSuffix + "." + extension);
    }
  },
});
const upload = multer({ storage: storageStrategy });

const router = express.Router();

/************************************ Add Product to DB POST: '/api/products/add-product' Login Required ************************************/
router.post(
  "/add-product",
  fetchuser,
  [
    //* Adding Validations using express-validator
    body("title", "Enter a Valid title").isLength({ min: 3 }),
    body("description", "Description must have atleast 5 charecters").isLength({
      min: 5,
    }),
    body("price", "price is a required field").exists(),
    body("category", "Invalid Category").isIn([
      "electronics",
      "books",
      "lab",
      "hostel",
      "fashion",
      "others",
    ]),
  ],
  async (req, res) => {
    try {
      const { title, description, price, category } = req.body;
      const user = await User.findById(req.user.id).select("-password");
      const college = user.college;
      //* check errors and send Bad requests
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0] });
      }
      //* Create a new Notes object and save it to DB
      const product = new Product({
        user: req.user.id,
        title,
        description,
        price,
        category,
        college,
      });
      const saveProduct = await product.save();
      res.json(saveProduct);
    } catch (error) {
      //* Send Internal Server Error
      console.error(error.message);
      res.status(500).json({ errors: "Some error occured" });
    }
  }
);
router.post(
  "/uploadImg",
  fetchuser,
  upload.single("productImg"),
  async (req, res) => {
    try {
      console.log("reached");
      const user = await Product.findOneAndUpdate(
        { user: req.user.id },
        {
          productImg: req.file.path,
        },
        {
          new: true,
        }
      );
      res.json(user);
    } catch (error) {
      //* Send Internal Server Error
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

/************************************ Set Product Status to SOLD POST: '/api/products/status/:pid' Login Required ************************************/
router.post("/status/:pid", fetchuser, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.pid, user: req.user.id },
      {
        status: "sold",
      },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    //* Send Internal Server Error
    console.error(error.message);
    res.status(500).json({ errors: "Some error occured" });
  }
});

/******************** Get Products of certain Category to DB GET: '/api/products/category/:type' Login Required *****************************/
router.get("/category/:type", fetchuser, async (req, res) => {
  try {
    // console.log(req.user);
    const user = await User.findById(req.user.id).select("-password");
    const products = await Product.find({
      category: req.params.type,
      college: user.college,
      status: "active",
    }).sort({
      _id: -1,
    });
    res.json(products);
  } catch (error) {
    //* Send Internal Server Error
    console.error(error.message);
    res.status(500).json({ errors: "Some error occured" });
  }
});

/************************************ Get all Products of a User GET: '/api/products/user' Login Required ************************************/
router.get("/user", fetchuser, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({
      _id: -1,
    });
    res.json(products);
  } catch (error) {
    //* Send Internal Server Error
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
});

module.exports = router;
