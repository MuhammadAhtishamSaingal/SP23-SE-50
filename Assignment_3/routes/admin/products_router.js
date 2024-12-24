

const express = require("express")
let router = express()



let Product = require("../../models/product")

//read
router.get("/admin/product",async(req,res)=>{
    let products = await Product.find()
    res.render("pages/admin/product",{layout: "admin-layout.ejs",products});
})
// delete
router.get("/admin/products/delete/:id",async (req,res)=>{
    await Product.findByIdAndDelete(req.params.id)
    res.redirect("/admin/product")
})
//update
router.get("/admin/products/edit/:id",async (req,res)=>{
    let product = await Product.findById(req.params.id)
    res.render("pages/admin/edit",{layout: "admin-layout.ejs",product})
})
router.post("/admin/products/edit/:id",async (req,res)=>{
    let product = await Product.findById(req.params.id)
    product.title = req.body.title
    product.description =req.body.description
    product.price = req.body.price
    product.save();
    res.redirect("/admin/product");
})

//create
router.get("/admin/products/create",(req,res)=>{
    res.render("pages/admin/create",{layout: "admin-layout.ejs"})
 })

router.post("/admin/create",async (req,res)=>{
    let product = new Product(req.body)
    await product.save()
    res.redirect("/admin/product")
})

module.exports=router