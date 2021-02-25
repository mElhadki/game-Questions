let Gift = require("../models/gift.model")

exports.add = (req, res) => {
    let gift = req.body.gift; 

    let giftPush = new Gift({
        gift
    })
    giftPush.save().then((gift) => res.json(gift))
}