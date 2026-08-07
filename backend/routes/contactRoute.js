const route = require("express");
const router = route();

const contactController = require("../controllers/contactController");

router.get("/",  contactController.getInitial);


module.exports = router;