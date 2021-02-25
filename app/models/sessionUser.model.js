const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionUser = new Schema(
    {
        idUser: {
            type: String,
            trim: true,
            minlenght: 10,
        },
        isOwner: {
            type: Boolean,
            trim: true,
            required : true,
        },
    },
    {
        versionKey: false
    }
)

const SessionEx = mongoose.model("SessioUser", SessionUser);
module.exports = SessionEx;