const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Add to cart
router.post('/add-to-cart', async (req, res) => {
    try {
        const { productId } = req.body;
        console.log('Received productId:', productId);
        
        // Get existing cart from cookies or initialize empty cart
        let cart = req.cookies.cart || [];
        
        // Clean up cart data - remove invalid entries
        cart = cart.filter(item => item.productId);
        
        console.log('Current cart:', cart);
        
        // Check if product exists first
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingProductIndex >= 0) {
            // If product exists, increment quantity
            cart[existingProductIndex].quantity += 1;
        } else {
            // If product doesn't exist, add it with quantity 1
            cart.push({
                productId: productId,
                quantity: 1
            });
        }
        
        // Update cookie
        res.cookie('cart', cart, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        });
        
        console.log('Updated cart:', cart);
        res.json({ success: true, cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, error: 'Failed to add to cart' });
    }
});

// View cart
router.get('/view-cart', async (req, res) => {
    try {
        const cart = req.cookies.cart || [];
        console.log('Cart from cookies:', cart);
        
        if (!cart.length) {
            return res.render('pages/main/cart', { cartItems: [], totalAmount: 0 });
        }
        
        // Fetch full product details for each item in cart
        const cartWithDetails = await Promise.all(cart.map(async (item) => {
            try {
                const product = await Product.findById(item.productId);
                console.log('Found product:', product);
                
                if (!product) return null;
                
                return {
                    product,
                    quantity: item.quantity
                };
            } catch (err) {
                console.error('Error fetching product:', err);
                return null;
            }
        }));

        // Filter out any null entries (deleted products)
        const validCartItems = cartWithDetails.filter(item => item !== null);
        console.log('Valid cart items:', validCartItems);
        
        const totalAmount = validCartItems.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        
        res.render('pages/main/cart', { 
            cartItems: validCartItems,
            totalAmount: totalAmount
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.render('pages/main/cart', { cartItems: [], totalAmount: 0 });
    }
});

// Update cart quantity
router.post('/update-cart-quantity', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = req.cookies.cart || [];
        
        // Clean up cart data - remove invalid entries
        cart = cart.filter(item => item.productId);
        
        const productIndex = cart.findIndex(item => item.productId === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: 'Product not found in cart' });
        }

        // Update quantity
        cart[productIndex].quantity = parseInt(quantity);
        
        // Get product price for subtotal calculation
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        const subtotal = product.price * quantity;
        
        // Calculate new total
        let total = 0;
        for (const item of cart) {
            const prod = await Product.findById(item.productId);
            if (prod) {
                total += prod.price * item.quantity;
            }
        }

        // Update cookie
        res.cookie('cart', cart, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        });

        res.json({ 
            success: true, 
            subtotal: subtotal,
            total: total,
            quantity: quantity
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ success: false, error: 'Failed to update quantity' });
    }
});

// Remove from cart
router.post('/remove-from-cart', async (req, res) => {
    try {
        const { productId } = req.body;
        let cart = req.cookies.cart || [];
        
        // Clean up cart data - remove invalid entries
        cart = cart.filter(item => item.productId);
        
        // Remove item from cart
        cart = cart.filter(item => item.productId !== productId);
        
        // Calculate new total
        let total = 0;
        for (const item of cart) {
            const product = await Product.findById(item.productId);
            if (product) {
                total += product.price * item.quantity;
            }
        }

        // Update cookie
        res.cookie('cart', cart, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        });

        res.json({ 
            success: true, 
            total: total,
            cartLength: cart.length
        });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ success: false, error: 'Failed to remove item' });
    }
});

module.exports = router; 