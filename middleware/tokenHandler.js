

const jwt = require('jsonwebtoken');
let map = new Map();

const secretKey = process.env.JWT_SECRET

const tokenValidator = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send("Unauthorized: No token provided.");
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        
        if(err || !map.has(decoded.email)) {
            // Token is invalid or not found in the map
            return res.status(403).send("Forbidden: Invalid token.");
        }
        req.email = decoded.email;
        next();
    });
}
const createToken = async (email) => {
        token = await jwt.sign({email}, secretKey);
        map.set(email,token);
        return token;
}
module.exports = {
    tokenValidator,createToken
}

