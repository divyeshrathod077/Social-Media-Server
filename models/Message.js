import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    media: {
      type: String,
      default: "",
    },

    mediaType: {
      type: String,
      enum: ["image", "video", ""],
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Message",
  messageSchema
);