import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  media: String, // Stores media file URL
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
