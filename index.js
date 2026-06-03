import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

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
   MIDDLEWARE
========================= */

app.use(express.json());

/* =========================
   CORS FIX (IMPORTANT)
========================= */

const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3002",
  "https://social-media-user-mvjp.vercel.app",
  normalizeOrigin(process.env.FRONTEND_URL),
]
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server / mobile apps / Postman
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);
    return callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/* =========================
   SECURITY
========================= */

app.use(helmet());

app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

app.use(morgan("common"));

/* =========================
   BODY PARSER
========================= */

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

/* =========================
   STATIC FILES
========================= */

app.use(
  "/assets",
  express.static(path.join(__dirname, "public/assets"))
);

/* =========================
   ROUTES
========================= */

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* =========================
   DATABASE
========================= */

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log(" MongoDB Connected");

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });

    /* =========================
       SEED DATABASE
    ========================= */

    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log(" Seeding database...");

      await User.insertMany(users);

      const fixedPosts = posts.map((post) => ({
        ...post,
        mediaUrl:
          post.mediaUrl ||
          (post.picturePath
            ? `http://localhost:${PORT}/assets/${post.picturePath}`
            : ""),
        mediaType: post.mediaType || "image",
      }));

      await Post.insertMany(fixedPosts);

      console.log(" Database Seeded");
    } else {
      console.log(" Seed skipped");
    }
  })
  .catch((err) => {
    console.log(" DB Error:", err);
  });