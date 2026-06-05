import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: [String],
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Conversation",
  conversationSchema
);