const express = require('express');
const router = express.Router();
const Admin = require('../../models/admin');
const bcrypt = require('bcryptjs');

// Middleware to check if admin is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
        res.locals.adminId = req.session.adminId;
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Login page
router.get('/admin/login', (req, res) => {
    res.render('pages/admin/login', { layout: false });
});

// Register page
router.get('/admin/register', (req, res) => {
    res.render('pages/admin/register', { layout: false });
});

// Handle login
router.post('/admin/login', async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        if (!admin) {
            return res.render('pages/admin/login', { 
                layout: false,
                error: 'Invalid credentials' 
            });
        }

        const validPassword = await bcrypt.compare(req.body.password, admin.password);
        if (!validPassword) {
            return res.render('pages/admin/login', { 
                layout: false,
                error: 'Invalid credentials' 
            });
        }

        req.session.adminId = admin._id;
        res.locals.adminId = admin._id;
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('pages/admin/login', { 
            layout: false,
            error: 'An error occurred' 
        });
    }
});

// Handle register
router.post('/admin/register', async (req, res) => {
    try {
        const admin = new Admin({
            username: req.body.username,
            password: req.body.password
        });
        await admin.save();
        res.redirect('/admin/login');
    } catch (error) {
        res.render('pages/admin/register', { 
            layout: 'admin-layout',
            error: 'Registration failed' 
        });
    }
});

// Logout
router.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Add this route after the login/register routes
router.get('/admin/dashboard', isAuthenticated, async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        res.render('pages/admin/dashboard', { 
            layout: 'admin-layout',
            admin: admin,
            username: admin.username
        });
    } catch (error) {
        res.redirect('/admin/login');
    }
});

module.exports = { router, isAuthenticated }; 