var express = require("express");
var router = express.Router();
let messageModel = require("../schemas/messages");
let { CheckLogin } = require('../utils/authHandler');
let mongoose = require('mongoose');

// get message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn cho user hiện tại
router.get("/", CheckLogin, async function (req, res, next) {
  try {
    const userId = req.user._id;

    const messages = await messageModel.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$from", userId] },
              then: "$to",
              else: "$from"
            }
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Populate user info if necessary
    await messageModel.populate(messages, { path: "from to", select: "username fullName avatarUrl" });

    res.send(messages);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// lấy toàn toàn bộ message from: user hiện tại, to :userID và from: userID và to:user hiện tại
router.get("/:userID", CheckLogin, async function (req, res, next) {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userID;

    let messages = await messageModel.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    }).sort({ createdAt: 1 })
      .populate('from', 'username fullName avatarUrl')
      .populate('to', 'username fullName avatarUrl');

    res.send(messages);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// post nội dung bao gồm...
router.post("/", CheckLogin, async function (req, res, next) {
  try {
    const currentUserId = req.user._id;
    const { to, type, text } = req.body;

    if (!to || !type || !text) {
      return res.status(400).send({ message: "Missing required fields: to, type, text" });
    }

    if (!['file', 'text'].includes(type)) {
      return res.status(400).send({ message: "Invalid type. Must be 'file' or 'text'" });
    }

    let newMessage = await messageModel.create({
      from: currentUserId,
      to,
      messageContent: {
        type,
        text
      }
    });

    res.send(newMessage);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
