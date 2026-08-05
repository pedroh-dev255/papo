const route = require("express");
const router = route();

const upload = require("../middlewares/uploadAvatar");
const userController = require("../controllers/userController");

router.post("/register", upload.single("avatar"), userController.register);

module.exports = router;