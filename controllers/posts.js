import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;

    const user = await User.findById(userId);

    let picturePath = "";
    let videoPath = "";

    // CLOUDINARY FILE
    if (req.file) {
      // VIDEO
      if (req.file.mimetype.startsWith("video")) {
        videoPath = req.file.path;
      }
      // IMAGE
      else {
        picturePath = req.file.path;
      }
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,

      description,

      userPicturePath: user.picturePath,

      picturePath,
      videoPath,

      likes: {},
      comments: [],
    });

    await newPost.save();

    const posts = await Post.find().sort({ createdAt: -1 });

    res.status(201).json(posts);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* GET FEED POSTS */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

/* GET USER POSTS */
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

/* LIKE / UNLIKE POST */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);

    const isLiked = post.likes.get(userId);

    // UNLIKE
    if (isLiked) {
      post.likes.delete(userId);
    }
    // LIKE
    else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        likes: post.likes,
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // DELETE IMAGE
    if (post.picturePath && post.publicId) {
      await cloudinary.uploader.destroy(
        post.publicId
      );
    }

    // DELETE VIDEO
    if (post.videoPath && post.publicId) {
      await cloudinary.uploader.destroy(
        post.publicId,
        {
          resource_type: "video",
        }
      );
    }

    // DELETE DATABASE POST
    await Post.findByIdAndDelete(id);

    // RETURN UPDATED POSTS
    const posts = await Post.find().sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
};