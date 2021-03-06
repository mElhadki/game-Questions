let config = require("../config/secretJwt.config");
let jwt = require('jsonwebtoken');

exports.participant = (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.send({
            auth: false,
            message: 'token please ...'
        });

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err)
            return res.send({
                auth: false,
                message: 'false token'
            });
            if(decoded.participant == false || decoded.participant == undefined){
                return res.send({
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