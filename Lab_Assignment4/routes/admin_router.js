// Update the product route to handle sorting
router.get('/admin/product/:page', isAdmin, async (req, res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.params.page) || 1;
        const sort = req.query.sort || 'price_asc'; // Default sorting
        
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
            sort: sort // Pass sort parameter to view
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
}); 