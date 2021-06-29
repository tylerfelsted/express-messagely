const express = require("express");

const router = new express.Router;
const ExpressError = require('../expressError');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const user = await User.authenticate(username, password);
        if(user) {
            const payload = {username};
            const token = jwt.sign(payload, SECRET_KEY);
            return res.json(token);
        } else {
            throw new ExpressError("Invalid username/password", 401);
        }
    } catch (e) {
        return next(e);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        const {username, password, first_name, last_name, phone} = req.body;
        new_user = await User.register({username, password, first_name, last_name, phone});
        const payload = {
            username: new_user.username
        }
        await User.updateLoginTimestamp(new_user.username);
        const token = jwt.sign(payload, SECRET_KEY);
        return res.status(201).json({token});
    } catch (e) {
        return next(e)
    }
});

module.exports = router;