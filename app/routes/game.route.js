module.exports = app => {
    const router = require("express").Router();
    const participantMiddleware = require("../middlewares/participant.middleware")
    const gameController = require("../controllers/game.controller")

    router.route("/createGroup").get(participantMiddleware.participant, gameController.creategroup)
    router.route("/joinGroup/:code").get(participantMiddleware.participant, gameController.joinGroup)
    router.route("/createRound/:idGroup").get(gameController.creeatRound);
    router.route("/:roundId&:q").get(participantMiddleware.participant, gameController.game)
    router.route("/:roundId&:q").post(participantMiddleware.participant, gameController.postgame)
    app.use("/game", router)
}