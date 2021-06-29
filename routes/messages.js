const express = require("express");

const router = new express.Router;
const ExpressError = require('../expressError');
const User = require('../models/user');
const Message = require('../models/message')
const {ensureLoggedIn} = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try{
        const id = Number(req.params.id);
        const message = await Message.get(id);
        if(req.user.username !== message.from_user.username && req.user.username !== message.to_user.username) {
            throw new ExpressError("Not authorized", 401)
        }
        return res.json({message})
    } catch(e) {
        return next(e);
    }
})



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const {to_username, body} = req.body;
        const from_username = req.user.username;
        const message = await Message.create({from_username, to_username, body});
        return res.status(201).json({message});
    } catch(e) {
        return next(e);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const message = await Message.get(id)
        const to_user = message.to_user.username;
        if(req.user.username !== to_user) {
            throw new ExpressError("Not authorized", 401);
        }
        const result = await Message.markRead(id);
        return res.json({message: result});
    } catch(e) {
        return next(e);
    }
})


module.exports = router;