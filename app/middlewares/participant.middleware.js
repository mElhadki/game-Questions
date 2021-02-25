let config = require("../config/secretJwt.config");
let jwt = require('jsonwebtoken');

exports.participant = (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({
            auth: false,
            message: 'token please ...'
        });

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err)
            return res.status(500).send({
                auth: false,
                message: 'false token'
            });
            if(decoded.participant == false){
                return res.status(403).send({
                    auth: false,
                    message: 'not authorized ...'
                });
            }
            else{
                req.idParticpant = decoded.id
                next();
            }
    })
}