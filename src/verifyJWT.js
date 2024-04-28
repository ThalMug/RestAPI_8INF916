const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user_id = user.user_id;
            req.role = user.role;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = verifyJWT;