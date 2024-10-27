 const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");


// //@description     Create or fetch One to One Chat
// //@route           POST /api/chat/
// //@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
// bech nchoufou est ce luserid haka fema chat maah ou non si fema
// chat nimportiw chat model c nn asn3lna chat maa luser haka 
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
 }
// // bech nchoufou user loged in wil user eli bech nahkiw maah est que mewjoudin oun 
// // si mich mejoudin rahou femech chat c nn rahou fema chat
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
//   //si chat existe raja3li les information koul aalih ke password 
    .populate("users", "-password")
//     // 5atr chat feha latest message flmmodel taha 
    .populate("latestMessage");
// // puisque lchatmodel zeda feha sender de message lzm nhoutouh
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
// // si chat existe send it c non asna3 new chat 
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// // //@description     Fetch all chats for a user
// // //@route           GET /api/chat/
// // //@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

 module.exports = {accessChat,fetchChats};