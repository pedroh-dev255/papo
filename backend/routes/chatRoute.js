const route = require("express");
const router = route();

const chatController = require("../controllers/chatController");

router.get("/",  chatController.getInitial);


module.exports = router;