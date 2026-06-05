
import express from "express";

import {
  createOrGetConversation,
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/message.js";

import upload from "../middleware/chatupload.js";

const router = express.Router();

/* CONVERSATION */

router.post(
  "/conversation",
  createOrGetConversation
);

router.get(
  "/conversation/:userId",
  getConversations
);

/* MESSAGE */

router.post(
  "/message",

  upload.single("file"),

  sendMessage
);

router.get(
  "/message/:conversationId",

  getMessages
);

export default router;
