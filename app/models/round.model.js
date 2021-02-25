const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Round = new Schema(
    {
        idGroup: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
        question: {
            type: Object,
            required: true,
        },
        winnerId : {
            type: String,
            trim: true,
            minlenght: 10,  
        },
        scoreWinner : {
            type: Number,
            trim: true,
            minlenght: 1,
        }
    },
    {
        versionKey: false
    }
)

const GroupEx = mongoose.model("Round", Round);
module.exports = GroupEx;