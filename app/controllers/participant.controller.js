const Participant = require('../models/participant.model')
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let config = require("../config/secretJwt.config");

exports.register = (req, res) => {
    let username = req.body.username
    let phone = req.body.phone
    let password = bcrypt.hashSync(req.body.password, 10)
    let fullname = req.body.fullname
    let email = req.body.email
    let participantPush = new Participant({
        fullname,
        phone,
        username,
        password,
        email
    })
    Participant.findOne({ phone: req.body.phone })
        .then((participant) => {
            if (participant == null) {
                participantPush.save()
                    .then((participant) => res.json(participant))
                    .catch((err) => res.json(err))
            }
            else {
                res.json("erreur ce telephone deja utilisé !");
            }
        })
        .catch((err) => res.json(err))
}

exports.login = (req, res) => {
    let phone = req.body.phone;
    Participant.findOne({ phone: phone }).select('password').select('valid').then((login) => {
        // @ts-ignore
        var passwordIsValid = bcrypt.compareSync(req.body.password, login.password);
        if (!passwordIsValid) return res.status(401).send({
            message: "credential error"
        });
        // @ts-ignore
        else if (login.valid === false) {
            res.json("wait your validation account in your mail")
        }
        else {
            var token = jwt.sign({
                id: login._id,
                participant: true
            }, config.secret, {
                expiresIn: 86400
            })

            res.status(200).send({
                auth: true,
                token: token
            })
        }
    }).catch((err) => res.json(err))
}

exports.confirmaccount = (req, res) => {
    Participant.updateOne({ _id: req.params.id }, { $set: { valid: true } }).then(() => res.json("compte validé veuillez vous connectez"))
        .catch((err) => res.json(err))
}