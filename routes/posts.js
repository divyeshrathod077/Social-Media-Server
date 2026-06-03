import express from "express";

import {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  deletePost,
} from "../controllers/posts.js";

import { verifyToken} from "../middleware/auth.js";

import upload from "../middleware/upload.js";

const router = express.Router();

/* CREATE */
router.post(
  "/",
  verifyToken,
  upload.single("media"),
  createPost
);

/* READ */
router.get("/", verifyToken, getFeedPosts);

router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

router.delete(
  "/:id",
  verifyToken,
  deletePost
);
export default router;