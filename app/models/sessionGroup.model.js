const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionGroup = new Schema(
    {
        idGroup : {
            type: String,
            trim: true,
            minlenght: 10,
        },
        code: {
            type: String,
            trim: true,
            minlenght: 10,
        },
        roundId : {
            type: String,
            trim: true,
            minlenght: 10,
        },
        isFull: {
            type: Boolean,
            trim: true,
            required : true,
        },
    },
    {
        versionKey: false
    }
)

const SessionEx = mongoose.model("SessionGroup", SessionGroup);
module.exports = SessionEx;