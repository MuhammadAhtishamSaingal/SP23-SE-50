const express = require("express")
let app = express()

// Add mongoose import
const mongoose = require('mongoose');

// Add connectionString definition
const connectionString = "mongodb://127.0.0.1:27017/Jdot";

// Move all middleware to the top, before routes
const expresslayouts = require("express-ejs-layouts")
app.use(expresslayouts)

// Add express.json() middleware here, before routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine",'ejs');
app.use(express.static("public"))
app.use(express.static("uploads"));

// Import models
const Product = require("./models/product");
const category = require("./models/category");

// Rest of your existing imports
const routers = require("./routes/admin/products_router")
const session = require('express-session');
const { router: authRouter } = require('./routes/admin/auth_router');

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Add the auth router
app.use(authRouter);

// Cart routes
const cartRouter = require('./routes/cart_router');

// Add this line after other middleware setup
app.use(cartRouter);

// Route for women's category
app.get("/women", async (req, res) => {
    try {
        let products = await Product.find({ category: 'women' });
        res.render("pages/main/CategoryPages", { product: products });
    } catch (error) {
        console.error("Error fetching women's products:", error);
        res.status(500).send("Error loading products");
    }
});

// Route for men's category
app.get("/men", async (req, res) => {
    try {
        let products = await Product.find({ category: 'men' });
        res.render("pages/main/CategoryPages", { product: products });
    } catch (error) {
        console.error("Error fetching men's products:", error);
        res.status(500).send("Error loading products");
    }
});

// Route for boys & girls category
app.get("/boysgirls", async (req, res) => {
    try {
        let products = await Product.find({ category: 'boysgirls' });
        res.render("pages/main/CategoryPages", { product: products });
    } catch (error) {
        console.error("Error fetching boys & girls products:", error);
        res.status(500).send("Error loading products");
    }
});

// Generic category route (if you want to keep it)
app.get("/:Category", async (req, res) => {
    try {
        let products = await Product.find({ category: req.params.Category.toLowerCase() });
        res.render("pages/main/CategoryPages", { product: products });
    } catch (error) {
        console.error("Error fetching category products:", error);
        res.status(500).send("Error loading products");
    }
});

// Home route
app.get("/", (req, res) => {
    res.render("pages/main/landingpage");
});

// MongoDB connection
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(`Connected to MongoDB at: ${connectionString}`);
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Your other routes...
app.use(routers);

// Add this with your other requires
const checkoutRouter = require('./routes/checkout_router');

// Add this after other middleware setup
app.use(checkoutRouter);

app.listen(5000, () => {
    console.log("server created at location 5000")
});