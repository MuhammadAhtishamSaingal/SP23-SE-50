const express = require("express")
let router = express()
const { isAuthenticated } = require('./auth_router');

// Add isAuthenticated middleware to all admin routes
router.use('/admin/*', isAuthenticated);

let multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Directory to store files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});
const upload = multer({ storage: storage });

let Category = require("../../models/category")
let Product = require("../../models/product")
let Order = require("../../models/order")

//read & pagination
router.get(["/admin/product", "/admin/product/:page"], isAuthenticated, async (req, res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.params.page) || 1;
        const sort = req.query.sort || 'price_asc';
        
        // Determine sort order
        let sortQuery = {};
        switch(sort) {
            case 'price_desc':
                sortQuery = { price: -1 };
                break;
            case 'price_asc':
            default:
                sortQuery = { price: 1 };
                break;
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);

        // Get sorted and paginated products
        const products = await Product.find()
            .sort(sortQuery)
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('pages/admin/product', {
            products,
            totalPages,
            currentPage: page,
            sort: sort,
            layout: "admin-layout"  // Make sure this matches your layout file name
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


// delete
router.get("/admin/products/delete/:id",async (req,res)=>{
    await Product.findByIdAndDelete(req.params.id)
    res.redirect("/admin/product")
})
//update
router.get("/admin/products/edit/:id",async (req,res)=>{
    let product = await Product.findById(req.params.id)
    let category = await Category.find(); 
    res.render("pages/admin/edit",{layout: "admin-layout.ejs",product,category})
})
router.post("/admin/products/edit/:id",async (req,res)=>{
    let product = await Product.findById(req.params.id)
    product.title = req.body.title
    product.description =req.body.description
    product.price = req.body.price
    // Update the category
    if (req.body.category) {
      product.category = req.body.category;
   } 
    product.save();
    res.redirect("/admin/product");
})

//create
router.get("/admin/products/create",async(req,res)=>{
    let category = await Category.find(); // Fetch all categories
    res.render("pages/admin/create",{layout: "admin-layout.ejs",category}) // Pass categories to the form
 })

router.post("/admin/create", upload.single("file"), async (req,res)=>{
    console.log("File:", req.file);
    console.log("Body:", req.body);
    let product = new Product(req.body)
    if (req.file) {
        product.picture = req.file.filename;
        console.log("Saved picture path:", product.picture);
    }
    await product.save()
    res.redirect("/admin/product")
})




//category

router.get("/admin/category",async(req,res)=>{
    let category = await Category.find()
    res.render("pages/admin/category",{layout: "admin-layout.ejs",category})
    
 })


 router.get("/admin/category/create",async(req,res)=>{
    let category = await Category.find()
    res.render("pages/admin/create_category.ejs",{layout: "admin-layout.ejs",category})
    
 })

// category Create
router.get("/admin/category/create",(req,res)=>{
    res.render("pages/admin/create_category",{layout: "admin-layout.ejs"})
 })

router.post("/admin/category/create",async (req,res)=>{
    let category = new Category(req.body)
    await category.save()
    res.redirect("/admin/category")
})
//edit category
router.get("/admin/category/edit/:id",async (req,res)=>{
    let category = await Category.findById(req.params.id)
    res.render("pages/admin/edit_category",{layout: "admin-layout.ejs",category})
})
router.post("/admin/category/edit/:id",async (req,res)=>{
    let category = await Category.findById(req.params.id)
   category.title = req.body.title
    category.save();
    res.redirect("/admin/category");
})
// delete category
router.get("/admin/category/delete/:id",async (req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    res.redirect("/admin/category")
})
router.get("/admin/order", async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product');        
        res.render("pages/admin/order", {layout: "admin-layout.ejs", orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports=router