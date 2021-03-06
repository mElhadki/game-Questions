module.exports = app => {
    const router = require("express").Router();
    const participantController = require("../controllers/participant.controller")
    router.route("/register").post(participantController.register);
    router.route("/login").post(participantController.login);
    router.route("/valid/:id").get(participantController.confirmaccount);
    app.use('/participant', router)
}
