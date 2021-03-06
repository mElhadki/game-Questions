const Participant = require('../models/participant.model')
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let config = require("../config/secretJwt.config");

exports.register = (req, res) => {
    let username = req.body.username
    var match = /^(0)([ \-_/]*)(\d[ \-_/]*){9}$/g;
    var matchEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/g
    let phone = req.body.phone
    let passwordBrut = req.body.password;
    let password = bcrypt.hashSync(passwordBrut, 10)
    let fullname = req.body.fullname
    let email = req.body.email
    var error = [];

    if (fullname === "") {
        error.push("full name is empty !")
    }
    else if (fullname < 5) {
        error.push("full name is too short !");
    }

    if (username === "") {
        error.push("username is empty !")
    }
    else if (username < 4) {
        error.push("username is too short !");
    }
    if (phone == "") {
        error.push("phone is empty")
    }
    else if (!phone.match(match)) {
        error.push("phone invalid")
    }
    if (email == "") {
        error.push("email is empty")
    }
    else if (!email.match(matchEmail)) {
        error.push("email invalid")
    }
    if (passwordBrut === "") {
        error.push("password is empty")
    }
    else if (passwordBrut.length <= 3) {
        error.push("password is short")
    }
    if (error.length > 0) {
        res.json({ error: error })
    }
    else {
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
                        .then(() => res.json({notification : "wait an admin to valid your account ! an email will sended to you" }))
                        .catch((err) => res.json(err))
                }
                else {
                    error.push("phone already exist !")
                    res.json({ error: error});
                }
            })
            .catch((err) => res.json(err))
    }

}

exports.login = (req, res) => {
    let phone = req.body.phone;
    var match = /^(0)([ \-_/]*)(\d[ \-_/]*){9}$/g;
    var password = req.body.password;
    var error = [];

    if (phone == "") {
        error.push("phone is empty")
    }
    else if (!phone.match(match)) {
        error.push("phone invalid")
    }
    if (password === "") {
        error.push("password is empty")
    }
    else if (password.length <= 3) {
        error.push("password is short")
    }

    if (error.length > 0) {
        res.json({ error: error })
    }
    else {
        Participant.findOne({ phone: phone }).select('password').select('valid').then((login) => {
            if (login == null) {
                error.push("phone not found !")
                res.json({ error: error });
                return;
            }
            // @ts-ignore
            var passwordIsValid = bcrypt.compareSync(req.body.password, login.password);
            if (!passwordIsValid) {
                error.push("credential error !")
                return res.json({
                    error: error
                });
            }
            // @ts-ignore
            else if (login.valid === false) {
                error.push("wait your validation account in your mail !")
                res.json({ error: error });
                return;
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
}

exports.confirmaccount = (req, res) => {
    Participant.updateOne({ _id: req.params.id }, { $set: { valid: true } }).then(() => res.json("account approved !"))
        .catch((err) => res.json(err))
}