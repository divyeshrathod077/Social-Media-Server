import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import chatRoutes from "./routes/message.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";

import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =========================
   Middleware
========================= */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://social-media-user-mvjp.vercel.app", //  your frontend Vercel URL
  process.env.FRONTEND_URL, // optional env var
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/mobile apps
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log(" Blocked Origin:", origin);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Express v5 requires regex for preflight
app.options(/.*/, cors());

/* =========================
   Static Files
========================= */
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* =========================
   Routes
========================= */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);

/* =========================
   Server + Socket.IO
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // allow both
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(" User Connected:", socket.id);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers));
    console.log("Online Users:", onlineUsers);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text, image, video }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("getMessage", {
        senderId,
        text,
        image,
        video,
        createdAt: Date.now(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(" User Disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("getUsers", Array.from(onlineUsers));
  });
});

/* =========================
   Database + Server Start
========================= */
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log(" MongoDB Connected");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(` Server running on port ${PORT}`);
    });

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log(" Seeding database...");
      await User.insertMany(users);

      const fixedPosts = posts.map((post) => ({
        ...post,
        mediaUrl:
          post.mediaUrl ||
          (post.picturePath
            ? `${process.env.BACKEND_URL || "http://localhost:" + PORT}/assets/${post.picturePath}`
            : ""),
        mediaType: post.mediaType || "image",
      }));

      await Post.insertMany(fixedPosts);
      console.log(" Database Seeded");
    } else {
      console.log("Seed skipped");
    }
  })
  .catch((err) => console.log("DB Error:", err));
