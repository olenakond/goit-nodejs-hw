const express = require("express");
const { validateBody, authenticate } = require("../../middlewares");
const schemas = require("../../schemas/users");
const ctrl = require("../../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(schemas.userSchema), ctrl.register);

router.post("/login", validateBody(schemas.userSchema), ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/subscription", authenticate, validateBody(schemas.subscriptionSchema),  ctrl.changeSubscription);

module.exports = router;
