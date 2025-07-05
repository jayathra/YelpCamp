const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    // Only set returnTo if not already set by isLoggedIn middleware
    if (!req.session.returnTo &&
        req.headers.referer &&
        !req.headers.referer.includes('/login') &&
        !req.headers.referer.includes('/register')) {
        // Only set if coming from a different page
        const url = new URL(req.headers.referer);
        req.session.returnTo = url.pathname + url.search;
    }
    res.render('users/login')
}

module.exports.login = (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        delete res.locals.returnTo;
        res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout( function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds')
    });
}


