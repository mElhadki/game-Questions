module.exports = app => {
    const router = require("express").Router();
    const participantMiddleware = require("../middlewares/participant.middleware")
    const gameController = require("../controllers/game.controller")
    router.route("/createGroup").get(participantMiddleware.participant, gameController.creategroup)
    router.route("/sessionUser").get(participantMiddleware.participant, gameController.owner)
    router.route("/sessionGroup/:code").get(participantMiddleware.participant, gameController.isFull)
    router.route("/joinGroup/:code").get(participantMiddleware.participant, gameController.joinGroup)
    router.route("/createRound/:idGroup").get(gameController.creeatRound);
    router.route("/:roundId&:q").get(participantMiddleware.participant, gameController.game)
    router.route("/:roundId&:q").post(participantMiddleware.participant, gameController.postgame)
    router.route("/result/:roundId").get(participantMiddleware.participant, gameController.resultRound)
    router.route("/exitGame/:groupId").get(participantMiddleware.participant, gameController.exitGame)
    router.route("/lobby").get(participantMiddleware.participant, gameController.lobby)
    app.use("/game", router)
}