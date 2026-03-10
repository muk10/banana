const express = require("express");

const router = express.Router();

const { getMessage, createMessage, updateMessage, deleteMessage, getStatus } = require("../controllers/messageController");

router.get("/messages", getMessage);
router.post("/messages", createMessage);
router.put("/messages/:id", updateMessage);
router.delete("/messages/:id", deleteMessage);
router.get("/status", getStatus);
module.exports = router;
