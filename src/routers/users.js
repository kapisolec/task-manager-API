const { response } = require('express');
const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail } = require('../emails/account');

// USERS
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// logging
router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
});

// SENDING USER AVATAR

const upload = multer({
    limits: { fileSize: 10000000 },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|bmp)$/))
            return callback(new Error('ERROR! Please upload an image!'));
        callback(undefined, true);
    },
});

router.post(
    '/users/me/avatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send('File sent succesfully!');
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

// DELETING AVATAR

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.sendStatus(200);
});

// get av
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) throw new Error('No user or avatar');

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.sendStatus(404);
    }
});

// LOGOUT FROM ALL SESSIONS
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error);
    }
});

// LOGOUT FROM THIS SESSION
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error);
    }
});

// MAKE NEW USER
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    // if await function is fullfilled only then rest of the code is executed
    try {
        await user.save();
        console.log(user.email, user.name);
        // sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid updates' });

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();

        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    console.log(req.params.id);
    try {
        await req.user.remove();

        res.send(req.user);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
