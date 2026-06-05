
import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let resourceType = "image";

    if (
      file.mimetype.startsWith("video")
    ) {
      resourceType = "video";
    }

    /* CUSTOM FILE NAME */

    const fileName =
      Date.now() +
      "-" +
      file.originalname
        .split(".")[0]
        .replace(/\s+/g, "-");

    return {
      folder: "chatupload",

      resource_type: resourceType,

      public_id: fileName,
    };
  },
});

const upload = multer({
  storage,
});

export default upload;
