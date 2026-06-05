
import Conversation from "../models/Conversation.js";

import Message from "../models/Message.js";

/* CREATE OR GET CONVERSATION */

export const createOrGetConversation =
  async (req, res) => {
    try {
      const {
        senderId,
        receiverId,
      } = req.body;

      let conversation =
        await Conversation.findOne({
          members: {
            $all: [
              senderId,
              receiverId,
            ],
          },
        });

      if (!conversation) {
        conversation =
          await Conversation.create({
            members: [
              senderId,
              receiverId,
            ],
          });
      }

      res.status(200).json(
        conversation
      );
    } catch (err) {
      res.status(500).json(err);
    }
  };

/* SEND MESSAGE */

export const sendMessage = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
      senderId,
      text,
    } = req.body;

    let media = "";

    let mediaType = "";

    /* FILE */

    if (req.file) {
      media = req.file.path;

      mediaType =
        req.file.mimetype.startsWith(
          "video"
        )
          ? "video"
          : "image";
    }

    const message =
      await Message.create({
        conversationId,

        senderId,

        text,

        media,

        mediaType,
      });

    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage:
          text || "media file",

        updatedAt: new Date(),
      }
    );

    res.status(200).json(message);
  } catch (err) {
    console.log(err);

    res.status(500).json(err);
  }
};

/* GET MESSAGES */

export const getMessages = async (
  req,
  res
) => {
  try {
    const { conversationId } =
      req.params;

    const messages =
      await Message.find({
        conversationId,
      }).sort({
        createdAt: 1,
      });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* GET CONVERSATIONS */

export const getConversations =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const conversations =
        await Conversation.find({
          members: {
            $in: [userId],
          },
        }).sort({
          updatedAt: -1,
        });

      res.status(200).json(
        conversations
      );
    } catch (err) {
      res.status(500).json(err);
    }
  };
