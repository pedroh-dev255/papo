const route = require("express");
const router = route();

const chatController = require("../controllers/chatController");

router.get("/",  chatController.getInitial);
router.post("/chat", chatController.getChat);
router.get("/:id", chatController.getChatData);

module.exports = router;