// @ts-nocheck
let Admin = require("../models/admin.model");
let Participant = require("../models/participant.model");
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let config = require("../config/secretJwt.config");
const nodemailer = require("nodemailer");
var TeleSignSDK = require('telesignsdk');


exports.validaccount =  (req, res) => {
    Participant.findById(req.params.id).then(async (data) => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "elhadkimariem3@gmail.com", // generated ethereal user
                pass: "Eminem1996", // generated ethereal password
            },
        })
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"WHO WIN 1M ✈️" <elhadkimariem3@gmail.com>', // sender address
            to: data.email, // list of receivers
            subject: "Confirmation de COMPTE !", // Subject line
            text: "Reserved !", // plain text body
            html: "Bonjour <b> " + data.fullname +" </b><br><p>Voici le lien de confirmation : http://localhost:8080/participant/valid/"+data._id, // html body
        }).then(() => res.json("email sended")).catch(function (err) {
            console.log(err)
        });
        const customerId = "3C65B0C4-4F3D-45BA-B56F-1038461A42BB";
        const apiKey = "kB4dbo11cpcM++IfMC8BDmkISSt77lcub4SicW9QKwg9cdf9S5skwLSZJau889Cz8DHRdK6aWstJu8huoYXOiQ==kB4dbo11cpcM++IfMC8BDmkISSt77lcub4SicW9QKwg9cdf9S5skwLSZJau889Cz8DHRdK6aWstJu8huoYXOiQ==kB4dbo11cpcM++IfMC8BDmkISSt77lcub4SicW9QKwg9cdf9S5skwLSZJau889Cz8DHRdK6aWstJu8huoYXOiQ==";
        const rest_endpoint = "https://rest-api.telesign.com";
        const timeout = 10*1000; // 10 secs
      
        const client = new TeleSignSDK( customerId,
            apiKey,
            rest_endpoint,
            timeout // optional
            // userAgent
        );
        var phone = data.phone.substring(1);
        const phoneNumber = "+212"+phone;
        const message = "Bonjour validé votre compte apartir votre email";
        const messageType = "ARN";
      
        console.log("## MessagingClient.message ##");
      
        function messageCallback(error, responseBody) {
            if (error === null) {
                console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
                    ` => code: ${responseBody['status']['code']}` +
                    `, description: ${responseBody['status']['description']}`);
            } else {
                console.error("Unable to send message. " + error);
            }
        }
        client.sms.message(messageCallback, phoneNumber, message, messageType);
    })
 
}



exports.loginAdmin = (req, res) => {
    Admin.findOne({
        phone: req.body.phone
    }).select('password').select('superadmin').then((admin) => {
        var passwordIsValid = bcrypt.compareSync(req.body.password, admin.password);
        if (!passwordIsValid) return res.status(401).send({
            message: "credential error"
        });
        var token = jwt.sign({
            id: admin._id,
            superadmin: admin.superadmin,
        }, config.secret, {
            expiresIn: 86400
        })
        res.status(200).send({
            auth: true,
            token: token
        })
    }).catch((err) => {
        if (err) return res.status(500).send('Error server.')
    });
}

exports.createAdmin = (req, res) => {
    let username = req.body.username;
    let password = bcrypt.hashSync(req.body.password, 8);
    let phone = req.body.phone;
    let superadmin = req.body.superadmin
    var objPush = new Admin({
        username,
        password,
        phone,
        superadmin
    })
    objPush.save().then(admin => res.json(admin)).catch(err => res.json(err))
}

