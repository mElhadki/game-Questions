module.exports = app => {

    let giftController = require("../controllers/gift.controller")
    let adminMiddleware = require('../middlewares/admin.middleware')
    const router = require("express").Router();
    router.route("/add").post(adminMiddleware.admin, giftController.add)

    app.use("/gift", router)
}

