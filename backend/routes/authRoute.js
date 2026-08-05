const route = require("express");
const router = route();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login",  authController.login);
router.post("/logout", authMiddleware, authController.logout)

module.exports = router;