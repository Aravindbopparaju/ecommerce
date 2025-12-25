const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// ✅ MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Upload Image API
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  });
});

// Route for Images folder
app.use('/images', express.static('upload/images'));

// Middleware to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// User Schema
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

// Product Schema
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  description: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Login
app.post('/login', async (req, res) => {
  let success = false;
  let user = await Users.findOne({ email: req.body.email });

  if (!user || req.body.password !== user.password) {
    return res.status(400).json({ success, errors: "Invalid credentials" });
  }

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  success = true;
  res.json({ success, token });
});

// Signup
app.post('/signup', async (req, res) => {
  let success = false;
  let check = await Users.findOne({ email: req.body.email });

  if (check) {
    return res.status(400).json({ success, errors: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();
  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);

  success = true;
  res.json({ success, token });
});

// Products APIs
app.get("/allproducts", async (req, res) => {
  res.send(await Product.find({}));
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.send(products.slice(-8));
});

app.get("/popularinwomen", async (req, res) => {
  res.send(await Product.find({ category: "women" }).limit(4));
});

app.post("/relatedproducts", async (req, res) => {
  res.send(await Product.find({ category: req.body.category }).limit(4));
});

// Cart APIs
app.post('/addtocart', fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Added");
});

app.post('/removefromcart', fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Removed");
});

app.post('/getcart', fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Start Server
app.listen(port, () => {
  console.log("Server running on port " + port);
});
