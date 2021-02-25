const mongoose = require("mongoose");
var random = require('mongoose-simple-random');

const Schema = mongoose.Schema;

const Gift = new Schema(
    {
        gift: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
    },
    {
        versionKey: false
    }
)
Gift.plugin(random);
const GiftEx = mongoose.model("Gift", Gift);
module.exports = GiftEx;