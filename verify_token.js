const { blacklist } = require('./router/auth');
const config = require('config')
const jwt = require('jsonwebtoken');
console.log(blacklist)
function verifyToken(req, res, next) {
    const token = req.headers["x-auth-token"];

    if (token) {

        if (blacklist.includes(token)) {
            return res.status(401).json({ error: 'Token revoked. Please log in again.' });
        }
        jwt.verify(token, config.JwtKey, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Access Denied" });

            }
            else {
                req.userType = decoded.userType;
                console.log(decoded.userId)
                console.log(decoded.userType)
                req.id = decoded.userId;
                next();
            }

        })
    }
    else {
        return res.status(404).send({ message: "Token not found" });

    }
}
module.exports = verifyToken