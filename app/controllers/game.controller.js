const uniqid = require("uniqid");
let Group = require("../models/group.model")
let Question = require("../models/questions.model");
let Round = require("../models/round.model")
let SessionUser = require("../models/sessionUser.model");
let SessionGroup = require("../models/sessionGroup.model");
let Participant = require('../models/participant.model')
let Gift = require('../models/gift.model')

exports.creategroup = async (req, res) => {
   await SessionUser.findOne({ idUser: req.idParticpant, isOwner: true }).then(async (session) => {
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
                        isOwner: true,
                        code: code,
                        idGroup : group._id,
                        idRound : "waiting"
                    })
                    var sessionGroup = new SessionGroup({
                        idGroup: group._id,
                        code: code,
                        isFull: false
                    })
                    await sessionGroup.save()
                    await sessionUser.save().then(() => {
                        res.status(201).json({ code: code })
                    })

                })
                .catch((err) => res.status(500).json(err))
        }
        else {
            res.json({ error: "tu as deja creer un groupe" })
        }
    })

}
exports.owner = async (req, res) => {
    await SessionUser.findOne({ idUser: req.idParticpant }).then((session) => res.json(session))
}
exports.isFull = async (req, res) => {
    await SessionGroup.findOne({ code: req.params.code }).then((session) => res.json(session))
}
exports.joinGroup = async (req, res) => {
    await Group.findOne({ code: req.params.code }).then(async (group) => {
        if (group == null) {
            res.json({ error: "code invalid" });
        }
        else {
            await Group.findOne({ id_owner: req.idParticpant }).then(async (group) => {
                if (group == null) {
                    await Group.findOne({ id_joining: req.idParticpant }).then(async (group) => {
                        if (group == null) {
                            await Group.findOne({ code: req.params.code }).then((group) => {
                                // @ts-ignore
                                if (group.id_joining.length >= 3) {
                                    res.json({ error: "group est plein" })
                                }
                                else {
                                    Group.updateOne({ code: req.params.code }, { $push: { id_joining: req.idParticpant } })
                                        .then(async () => {
                                            await Group.findOne({ code: req.params.code }).then(async (group) => {
                                                if (group.id_joining.length === 3) {
                                                    var sessionUser = new SessionUser({
                                                        idUser: req.idParticpant,
                                                        isOwner: false,
                                                        code: req.params.code,
                                                        idGroup : group._id,
                                                        idRound : "waiting",
                                                    })
                                                    await sessionUser.save()
                                                  await  SessionGroup.findOne({ code: req.params.code }).then(async (group) => {
                                                        await SessionGroup.updateOne({ code: group.code }, { isFull: true })
                                                        res.redirect("http://localhost:8080/game/createRound/" + group.idGroup);
                                                    })
                                                }
                                                else {
                                                    var sessionUser = new SessionUser({
                                                        idUser: req.idParticpant,
                                                        isOwner: false,
                                                        code: req.params.code,
                                                        idGroup : group._id,
                                                        idRound : "waiting",
                                                    })
                                                    await sessionUser.save()
                                                    res.json({ code: req.params.code })
                                                }
                                            })
                                        })
                                        .catch((err) => res.json(err))
                                }
                            })
                        }
                        else {
                            res.json({ error: "tu es deja inscrit a ce group" });
                        }
                    })
                }
                else {
                    res.json({ error: "tu es deja le createur de group" })
                }
            })
        }
    })

}

exports.creeatRound = async (req, res) => {
    let idGroup = req.params.idGroup;
    let question;
    await Round.findOne({ idGroup: idGroup }).then(async (round) => {
        if (round == null) {
            await Question.findRandom({}, {}, { limit: 15 }, async function (err, results) {
                question = {
                    ...results
                }
                await Group.findOne({ _id: req.params.idGroup }).then(async (group) => {


                    let roundPush = new Round({
                        idGroup,
                        question,
                    })
                    await roundPush.save().then(async (round) => {
                       await SessionUser.update({idGroup : idGroup}, {"$set" : {"idRound" : round._id}}, {"multi": true})
                       await SessionGroup.updateOne({ idGroup: idGroup }, { roundId: round._id }).then(() => res.json(idGroup))
                    }).catch((err) => res.json(err))
                })
            });
        }
       
     
    }).catch((err) => res.send(err))

}

exports.game = (req, res) => {
    let roundId = req.params.roundId;
    let question = req.params.q;
    let indexQuestion = parseInt(question.substring(1)) - 1

    Round.findOne({ _id: roundId }).then((round) => {
        if (round == null) {
            res.json({error : "round invalid"})
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
                        question: `Question Number: ${parseInt(question.substring(1))} : ` + round.question[indexQuestion].question,
                        first_answer: answers[0],
                        second_answer: answers[1],
                        third_answer: answers[2],
                        fourth_answer: answers[3],
                    })
                })

            }
            else {
                res.json({expired : true});
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
        await Round.findOne({ _id: roundId }).then(async (round) => {
            if (round.question[indexQuestion].valid == true) {
                if (answer === round.question[indexQuestion].trueAnswer) {
                    await Participant.updateOne({ _id: req.idParticpant }, { $inc: { scoreTemp: round.question[indexQuestion].point } }).then(async () => {
                        await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false })
                    })
                }
                else {
                    await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false })
                }
            }
            else {
                res.json({ error: "question expiré" })

            }

        })
        res.redirect(`http://localhost:8080/game/result/${roundId}`)
    }
    else {
        if (!answer) {
            res.json({ error: "svp entrez la reponse" });
        }
        else {
            await Round.findOne({ _id: roundId }).then(async (round) => {
                if (round.question[indexQuestion].valid == true) {
                    if (answer === round.question[indexQuestion].trueAnswer) {
                        await Participant.updateOne({ _id: req.idParticpant }, { $inc: { scoreTemp: round.question[indexQuestion].point } }).then(async () => {
                            await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false })
                        })
                    }
                    else {
                        await Round.findOneAndUpdate({ _id: roundId }, { ["question." + indexQuestion + ".valid"]: false })
                    }
                }
                else {
                    res.json({ error: "question expiré" })

                }

            })
        }
    }
}

exports.resultRound = async (req, res) => {
    let roundId = req.params.roundId;
    await Round.findOne({ _id: roundId }).then(async (round) => {
        await Group.findOne({ _id: round.idGroup }).then(async (user) => {
            let participantArr = [];
            for (let i = 0; i < user.id_joining.length; i++) {
                participantArr.push(user.id_joining[i])
            }
            participantArr.push(user.id_owner);
            let scoreArr = [];
            let nameArr = [];
            for (let i = 0; i < participantArr.length; i++) {
                await Participant.findById(participantArr[i]).then((users) => {
                    scoreArr.push(users.scoreTemp)
                    nameArr.push(users.username)
                })
            }
            let scoreBoard = scoreArr.sort(function (a, b) {
                return a - b;
            });
            let indexOfWinner = scoreArr.indexOf(scoreBoard[3]);
            await Participant.findById(req.idParticpant).then(async (score) => {
                let scoreId = score.scoreTemp;
                let status;
                await Gift.findRandom({}, {}, { limit: 1 }, async function (err, results) {
                    var data = { results };
                    let gift;
                    if (scoreId === scoreBoard[3]) {
                        status = true
                        gift = data.results[0].gift;
                    }
                    else {
                        status = false
                        gift = "aucune"
                    }

                    res.json(
                        {
                            scoreBoard: {
                                winner: nameArr[indexOfWinner],
                                score_Winner: scoreBoard[3],
                                your_score: scoreId,
                                your_gift: gift,
                                are_you_winner: status
                            }
                        })
                })

            })
        })
    })
}

exports.exitGame = async (req, res) => {
    let groupId = req.params.groupId;
    let usersArray = [];

    await Group.findById(groupId).then(async (group) => {
        for (let i = 0; i < group.id_joining.length; i++) {
            await usersArray.push(group.id_joining[i])
        }
        await usersArray.push(group.id_owner)
        await Round.findOneAndDelete({ idGroup: groupId })
        await SessionGroup.findOneAndDelete({ idGroup: groupId })
        await SessionUser.findOneAndDelete({ idUser: usersArray[3] })
        await SessionUser.findOneAndDelete({ idUser: usersArray[2] })
        await SessionUser.findOneAndDelete({ idUser: usersArray[1] })
        await SessionUser.findOneAndDelete({ idUser: usersArray[0] })
        for (let i = 0; i < usersArray.length; i++) {
            await Participant.findByIdAndUpdate(usersArray[i], { scoreTemp: 0 })
        }
        await Group.findByIdAndDelete(groupId).then(() => {
            res.redirect("http://localhost:8080/game/lobby")
        })
    })
}

exports.lobby = (req, res) => {
    res.json({
        message: "Fin de jeu bienvenue a votre lobby"
    })
}