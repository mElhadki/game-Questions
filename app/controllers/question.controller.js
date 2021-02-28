const Question = require("../models/questions.model")


exports.create = (req, res) => {

    let pushQuestion = new Question({
        question : req.body.question,
        trueAnswer : req.body.trueanswer,
        falseAnswer : [req.body.falseanswer1, req.body.falseanswer2, req.body.falseanswer3],
        point : req.body.point
    })
    pushQuestion.save()
        .then((question) => res.status(201).json(question))
        .catch((err) => res.status(500).json(err))
}

exports.findAll = (req, res) => {
    Question.find()
        .then((question) => res.status(200).json(question))
        .catch((err) => res.status(500).json(err))
}

exports.find = (req, res) => {
    Question.findOne({ _id: req.params.id })
        .then((question) => res.status(200).json(question))
        .catch((err) => res.status(500).json(err))
}

exports.update = (req, res) => {
    Question.updateOne({ _id: req.params.id }, { $set: { question: req.body.question, trueAnswer: req.body.trueanswer, falseAnswer: req.body.falseanswer,  } })
        .then(() => res.status(200).json("question modifier ! "))
        .catch((err) => res.status(500).json(err))
}

exports.delete = (req, res) => {
    Question.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).json("question est supprimé"))
        .catch((err) => res.status(500).json(err))
}