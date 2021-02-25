module.exports = app => {
    const router = require("express").Router();
    const adminMiddleware = require("../middlewares/admin.middleware");
    const questionController = require("../controllers/question.controller")

    router.route("/").get(adminMiddleware.admin, questionController.findAll);
    router.route("/add").post(adminMiddleware.admin, questionController.create)
    router.route("/update/:id").put(adminMiddleware.admin, questionController.update)
    router.route("/:id").get(adminMiddleware.admin, questionController.find)
    router.route("/delete/:id").delete(adminMiddleware.admin, questionController.delete)
    app.use("/question", router);
}


