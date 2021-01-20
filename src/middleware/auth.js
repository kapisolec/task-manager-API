const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisismynewcours');
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        });

        if (!user) throw new Error();
        // console.log(user);
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.send(e);
        console.log('ERROR FROM AUTH: ' + e);
    }
};

module.exports = auth;
