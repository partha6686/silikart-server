const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  productImg: {
    type: String,
    default: "uploads/product.png",
  },
  category: {
    type: String,
    enum: ["electronics", "books", "lab", "hostel", "fashion", "others"],
    default: "others",
  },
  status: {
    type: String,
    enum: ["active", "sold"],
    default: "active",
  },
  college: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Product", ProductSchema);
