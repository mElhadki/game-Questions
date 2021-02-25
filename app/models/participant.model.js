const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Participant = new Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            minlenght: 4,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            minlenght: 4,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            select: false,
            minlenght: 4,
        },
        valid: {
            type: Boolean,
            default: false
        },
        scoreTemp : {
            type: Number,
            trim: true,
            minlenght: 1,
        }
    },
    {
        versionKey: false
    }
);

const ParticipantEx = mongoose.model("Participant", Participant);
module.exports = ParticipantEx;