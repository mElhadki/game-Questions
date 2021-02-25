module.exports = app => {
    const router = require("express").Router();
    const adminController = require("../controllers/admin.controller");
    const adminMiddlewares = require("../middlewares/admin.middleware");

    router.route("/addAdmin").post(adminMiddlewares.superadmin, adminController.createAdmin);
    router.route("/login").post(adminController.loginAdmin)
    router.route("/validaccount/:id").get(adminMiddlewares.admin, adminController.validaccount)
    app.use('/admin', router)
}

