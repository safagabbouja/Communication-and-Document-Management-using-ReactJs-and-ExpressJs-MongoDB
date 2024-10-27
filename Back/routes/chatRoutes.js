const express = require("express");
const {accessChat,fetchChats} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// kif nhoutou protect yani ken les utilsateurs authentifée ynejmou yaccediw ll route haka 
router.route("/").post(protect,accessChat);
//yjib chats koul ml data base lil user particulier 
router.route("/").get(protect, fetchChats);
//crud groupe 
// router.route("/group").post(protect, createGroupChat);
// router.route("/rename").put(protect, renameGroup);
// router.route("/groupremove").put(protect, removeFromGroup);
// router.route("/groupadd").put(protect, addToGroup);
module.exports = router;