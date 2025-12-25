const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// -------------------- MongoDB Connection --------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// -------------------- Image Upload (Multer) --------------------
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Upload image API
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`,
  });
});

// Static images route
app.use("/images", express.static("upload/images"));

// -------------------- JWT Middleware --------------------
const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// -------------------- Mongoose Models --------------------
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  description: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// -------------------- Test Route --------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// -------------------- Auth Routes --------------------
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
      name: username,
      email,
      password,
      cartData: cart,
    });

    await user.save();

    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// -------------------- Product Routes --------------------
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.json(products.slice(-8));
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find({ category: "women" }).limit(4);
  res.json(products);
});

app.post("/relatedproducts", async (req, res) => {
  const { category } = req.body;
  const products = await Product.find({ category }).limit(4);
  res.json(products);
});

// -------------------- Cart Routes --------------------
app.post("/addtocart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  user.cartData[req.body.itemId] += 1;
  await user.save();
  res.send("Added");
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  if (user.cartData[req.body.itemId] > 0) {
    user.cartData[req.body.itemId] -= 1;
  }
  await user.save();
  res.send("Removed");
});

app.post("/getcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  res.json(user.cartData);
});

// -------------------- Admin Product Routes --------------------
app.post("/addproduct", async (req, res) => {
  const products = await Product.find({});
  const id = products.length ? products[products.length - 1].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true });
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
