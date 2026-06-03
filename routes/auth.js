import express from "express";
import { login, register } from "../controllers/auth.js";
import multer from "multer";

const router = express.Router();

/* MULTER STORAGE */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/assets"),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

/* ROUTES */
router.post("/register", upload.single("picture"), register);
router.post("/login", login);

export default router;