module.exports = app => {
    const router = require("express").Router();
    const participantMiddleware = require("../middlewares/participant.middleware")
    router.route("/check").get(participantMiddleware.participant, (req, res) => res.json({token : "token valid", auth : true}))
    app.use("/token", router)
}