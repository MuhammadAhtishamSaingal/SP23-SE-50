const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

// Shipping information page
router.get('/checkout/shipping', async (req, res) => {
    try {
        const cart = req.cookies.cart || [];
        if (!cart.length) {
            return res.redirect('/view-cart');
        }

        const cartWithDetails = await Promise.all(cart.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product) return null;
            return {
                product,
                quantity: item.quantity
            };
        }));

        const validCartItems = cartWithDetails.filter(item => item !== null);
        const totalAmount = validCartItems.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0);

        res.render('pages/checkout/shipping', {
            layout: false,
            cartItems: validCartItems,
            totalAmount: totalAmount
        });
    } catch (error) {
        console.error('Error loading shipping page:', error);
        res.status(500).send('Error loading checkout');
    }
});

// Process shipping information and show payment page
router.post('/checkout/shipping', async (req, res) => {
    try {
        // Store shipping info in session
        req.session.shippingInfo = {
            fullName: req.body.fullName,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            phone: req.body.phone,
            email: req.body.email
        };
        res.redirect('/checkout/payment');
    } catch (error) {
        console.error('Error processing shipping info:', error);
        res.status(500).send('Error processing shipping information');
    }
});

// Payment method page
router.get('/checkout/payment', async (req, res) => {
    if (!req.session.shippingInfo) {
        return res.redirect('/checkout/shipping');
    }

    try {
        const cart = req.cookies.cart || [];
        const cartWithDetails = await Promise.all(cart.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product) return null;
            return {
                product,
                quantity: item.quantity
            };
        }));

        const validCartItems = cartWithDetails.filter(item => item !== null);
        const totalAmount = validCartItems.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0);

        res.render('pages/checkout/payment', {
            layout: false,
            cartItems: validCartItems,
            totalAmount: totalAmount,
            shippingInfo: req.session.shippingInfo
        });
    } catch (error) {
        console.error('Error loading payment page:', error);
        res.status(500).send('Error loading payment page');
    }
});

// Process payment and show confirmation
router.post('/checkout/payment', async (req, res) => {
    try {
        const cart = req.cookies.cart || [];
        const cartWithDetails = await Promise.all(cart.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product) return null;
            return {
                product,
                quantity: item.quantity
            };
        }));

        const validCartItems = cartWithDetails.filter(item => item !== null);
        const totalAmount = validCartItems.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0);

        // Generate order number
        const orderNumber = 'ORD' + Date.now();

        // Create new order
        const order = new Order({
            orderNumber: orderNumber,
            items: validCartItems.map(item => ({
                product: item.product._id,
                title: item.product.title,
                price: item.product.price,
                quantity: item.quantity
            })),
            totalAmount: totalAmount,
            shippingInfo: req.session.shippingInfo,
            paymentInfo: {
                paymentMethod: req.body.paymentMethod,
                cardNumber: req.body.paymentMethod === 'card' ? req.body.cardNumber.slice(-4) : null,
                paymentStatus: req.body.paymentMethod === 'cod' ? 'pending' : 'completed'
            }
        });

        // Save order to database
        await order.save();

        // Store payment info and order number in session
        req.session.paymentInfo = {
            paymentMethod: req.body.paymentMethod,
            cardNumber: req.body.cardNumber,
            expiryDate: req.body.expiryDate,
            cvv: req.body.cvv
        };
        req.session.orderNumber = orderNumber;

        res.redirect('/checkout/confirmation');
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Error processing payment');
    }
});

// Order confirmation page
router.get('/checkout/confirmation', async (req, res) => {
    if (!req.session.paymentInfo || !req.session.shippingInfo) {
        return res.redirect('/checkout/shipping');
    }

    try {
        const order = await Order.findOne({ orderNumber: req.session.orderNumber })
            .populate('items.product');

        if (!order) {
            throw new Error('Order not found');
        }

        // Clear cart after successful order
        res.cookie('cart', [], {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'strict'
        });

        res.render('pages/checkout/confirmation', {
            layout: false,
            orderNumber: order.orderNumber,
            cartItems: order.items.map(item => ({
                product: item.product,
                quantity: item.quantity
            })),
            totalAmount: order.totalAmount,
            shippingInfo: order.shippingInfo,
            paymentInfo: req.session.paymentInfo
        });
    } catch (error) {
        console.error('Error loading confirmation page:', error);
        res.status(500).send('Error loading confirmation page');
    }
});

module.exports = router; 