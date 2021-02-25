const mongoose = require("mongoose");
var random = require('mongoose-simple-random');

const Schema = mongoose.Schema;

const Question = new Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            minlenght: 10,
        },
        trueAnswer: {
            type: String,
            required: true,
            trim: true,
            minlenght: 3,
        },
        falseAnswer:
            [
                {
                    type: String,
                    required: true,
                    trim: true,
                    minlenght: 3,
                }
            ],
        point: {
            type: Number,
            minlenght: 1,
            default: 0,
            required: true,
        },
        valid: {
            type:Boolean,
            default : true
        },
    },
    {
        versionKey: false
    }
)
Question.plugin(random);
const QuestionEx = mongoose.model("Question", Question);
module.exports = QuestionEx;