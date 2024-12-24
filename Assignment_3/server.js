const express = require("express")
let app = express()

const expresslayouts = require("express-ejs-layouts")
app.use(expresslayouts)

app.use(express.urlencoded());

const mongoose = require('mongoose');

app.set("view engine",'ejs');

app.use(express.static("public"))

const routers =require("./routes/admin/products_router")


// MongoDB connection (IPv4 version)
const connectionString = "mongodb://127.0.0.1:27017/Jdot";

mongoose.connect(connectionString, {
    // Optional parameters for clarity and potential backward compatibility
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(`Connected to MongoDB at: ${connectionString}`);
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});





app.use(routers)
app.get("/",(req,res)=>{
// res.send("Hello")
res.render("pages/main/landingpage");

})

app.get("/women",(req,res)=>{
    res.render("pages/main/women")
})


app.listen(5000,()=>{
    console.log("server created at location 5000")
})


