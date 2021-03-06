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
        code:{
            type: String,
            trim: true,
            minlenght: 10,
        },
        idGroup :{
            type: String,
            trim: true,
            minlenght: 10,
        },
        idRound :{
            type: String,
            trim: true,
            minlenght: 10,
        }
    },
    {
        versionKey: false
    }
)

const SessionEx = mongoose.model("SessioUser", SessionUser);
module.exports = SessionEx;