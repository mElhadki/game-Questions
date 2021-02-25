const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Group = new Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
        id_owner: {
            type: Schema.Types.ObjectId,
            ref: 'Participant',
            required: true,
        },
        id_joining: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Participant'
            }
        ]
    },
    {
        versionKey: false
    }
)

const GroupEx = mongoose.model("Group", Group);
module.exports = GroupEx;