// [>_]
const express = require("express");
const {
  startChat,
  getChatByChatId,
  sendMessageToChatId,
  getChats,
  getUserChats,
} = require("../services/dboperations");
const router = express.Router();

router.post("/start", startChat);

// message structure is
// {
//  sentBy : "user" || "admin"
//  message: String
// timeStamp: Date.now()
//}

// sends message to the specified chat id
router.post("/send", sendMessageToChatId); // note: send message also toggles the readBy flags
// should pass chatId in the body

router.post("/admin", getChats); // gets all the user, using post so that we can implement filter later ...

// return all the chat of the user
router.post("/user/:userId", getUserChats);

// return chat of particular id
router.post("/:chatId", getChatByChatId);
// body should conatin viewer to flip flag

module.exports = router;
