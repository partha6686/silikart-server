const connectMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

connectMongo();
const app = express();
const port = 3300;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/uploads", express.static("uploads"));

// All Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));

app.get("/", async (req, res) => {
  res.status(200).send("Hello");
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
