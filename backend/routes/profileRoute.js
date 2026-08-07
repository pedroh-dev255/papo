const route = require("express");
const router = route();

const profileController = require("../controllers/profileController")

router.get("/:id", profileController.getProfile);


module.exports = router;