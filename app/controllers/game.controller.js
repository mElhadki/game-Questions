const uniqid = require("uniqid");
let Group = require("../models/group.model")
let Question = require("../models/questions.model");
let Round = require("../models/round.model")
let SessionUser = require("../models/sessionUser.model");
let SessionGroup = require("../models/sessionGroup.model");
let Participant = require('../models/participant.model')

exports.creategroup = (req, res) => {
    SessionUser.findOne({ idUser: req.idParticpant, isOwner: true }).then(async (session) => {
        if (session == null) {
            let code = uniqid('CODE-');
            let id_owner = req.idParticpant;

            let groupPush = new Group({
                code,
                id_owner
            })
            await groupPush.save()
                .then(async (group) => {
                    var sessionUser = new SessionUser({
                        idUser: req.idParticpant,
                        isOwner: true
                    })
                    var sessionGroup = new SessionGroup({
                        idGroup: group._id,
                        code: code,
                        isFull: false
                    })
                    await sessionGroup.save()
                    await sessionUser.save().then(() => {
                        function interval() {
                            Round.findOne({ idGroup: group._id }).then((round) => {
                                if (round != null) {
                                    clearInterval(this);
                                    res.redirect("http://localhost:8080/game/createRound/" + round.idGroup)
                                }
                            }).catch((err) => res.json(err))
                        }
                        setInterval(interval, 2000);
                    })

                })
                .catch((err) => res.status(500).json(err))
        }
        else {
            res.json("tu as deja creer un groupe")
        }
    })

}

exports.joinGroup = (req, res) => {
    Group.findOne({ id_owner: req.idParticpant }).then(async (group) => {
        if (group == null) {
            await Group.findOne({ id_joining: req.idParticpant }).then(async (group) => {
                if (group == null) {
                    await Group.findOne({ code: req.params.code }).then((group) => {
                        // @ts-ignore
                        if (group.id_joining.length >= 3) {
                            res.json("group est plein")
                        }
                        else {
                            Group.updateOne({ code: req.params.code }, { $push: { id_joining: req.idParticpant } })
                                .then(async () => {
                                    await Group.findOne({ code: req.params.code }).then(async (group) => {
                                        if (group.id_joining.length === 3) {
                                            SessionGroup.findOne({ code: req.params.code }).then(async (group) => {
                                                await SessionGroup.updateOne({ code: group.code }, { isFull: true })
                                                res.redirect("http://localhost:8080/game/createRound/" + group.idGroup);
                                            })
                                        }
                                        else {
                                            function interval() {
                                                Round.findOne({ idGroup: group._id }).then((round) => {
                                                    if (round != null) {
                                                        clearInterval(this);
                                                        res.redirect("http://localhost:8080/game/createRound/" + round.idGroup)
                                                    }
                                                }).catch((err) => res.json(err))
                                            }
                                            setInterval(interval, 2000);
                                        }
                                    })
                                })
                                .catch((err) => res.json(err))
                        }
                    })
                }
                else {
                    res.json("tu es deja inscrit a ce group");
                }
            })
        }
        else {
            res.json("tu es deja le createur de group")
        }
    })
}

exports.creeatRound = (req, res) => {
    let idGroup = req.params.idGroup;
    let question;
    let idPlayer;
    Round.findOne({ idGroup: idGroup }).then((round) => {
        if (round == null) {
            Question.findRandom({}, {}, { limit: 15 }, function (err, results) {
                question = {
                    ...results
                }
                Group.findOne({ _id: req.params.idGroup }).then((group) => {


                    let roundPush = new Round({
                        idGroup,
                        question,
                    })
                    roundPush.save().then((round) => res.json({
                        instruction: "Bonjour dans votre round pour demarrer votre round veuillez entrer ce lien",
                        lien: `localhost:8080/game/:${round._id}&q1`
                    })).catch((err) => res.json(err))
                })
            });
        }
        else {

            res.json("bonjour dans votre round");

        }
    }).catch((err) => res.send(err))

}

exports.game = (req, res) => {
    let roundId = req.params.roundId;
    let question = req.params.q;
    let indexQuestion = parseInt(question.substring(1)) - 1

    Round.findOne({ _id: roundId }).then((round) => {
        if (round == null) {
            res.json("round invalid")
        }
        else {
            if (round.question[indexQuestion].valid == true) {
                Array.prototype.move = function (from, to) {
                    this.splice(to, 0, this.splice(from, 1)[0]);
                };
                var answers = [round.question[indexQuestion].falseAnswer[0], round.question[indexQuestion].falseAnswer[1], round.question[indexQuestion].falseAnswer[2], round.question[indexQuestion].trueAnswer];
                answers.move(Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1);

                Participant.findById(req.idParticpant).then((score) => {
                    scoree = score.scoreTemp
                    res.json({
                        votre_Score: scoree,
                        question: `question Numero ${parseInt(question.substring(1))} : ` + round.question[indexQuestion].question,
                        first_answer: answers[0],
                        second_answer: answers[1],
                        third_answer: answers[2],
                        fourth_answer: answers[3],
                    })
                })

            }
            else {
                res.json("question expiré !");
            }

        }
    })
}

exports.postgame = async (req, res) => {
    let roundId = req.params.roundId;
    let question = req.params.q;
    let indexQuestion = parseInt(question.substring(1)) - 1;
    let answer = req.body.answer;
    if (parseInt(question.substring(1)) + 1 >= 16) {
        res.redirect()
    }
    else {
        if (!answer) {
            res.json("svp entrez la reponse");
        }
        else {
            await Round.findOne({ _id: roundId }).then(async (round) => {
                if (round.question[indexQuestion].valid == true) {
                    if (answer === round.question[indexQuestion].trueAnswer) {
                        await Participant.updateOne({ _id: req.idParticpant }, { $inc: { scoreTemp: round.question[indexQuestion].point } }).then(async () => {
                            await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false }).then(() => res.redirect(`http://localhost:8080/game/${roundId}&q${parseInt(question.substring(1)) + 1}`)
                            )
                        })
                    }
                    else {
                        await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false }).then(() => res.redirect(`http://localhost:8080/game/${roundId}&q${parseInt(question.substring(1)) + 1}`)
                        )
                    }
                }
                else {
                    res.json("question expiré")

                }

            })
        }
    }
}

exports.resultRound = (req, res) => {
    let roundId = req.params.roundId;
    
    Round.findOne({_id : roundId}).then((round) => {
        let participantArr = [];
        Group.findOne({_id : round.idGroup}).then()
    })
}