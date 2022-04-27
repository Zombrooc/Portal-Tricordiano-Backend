require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");

const Post = require("../Models/Post");
const User = require("../Models/User");

module.exports = {
  async store(req, res, next) {
    let imageURL = undefined;

    if (req.file) {
      const { transforms: images, path } = req.file;

      imageURL = images[0].location;
    }

    const { userID } = req;
    const { title, content, hashtags } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const newPost = await Post.create({
      title,
      content,
      hashtags,
      image: imageURL,
      author: userID,
    });

    return res.status(200).send(newPost);
  },
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find()
      .populate("author")
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Post.countDocuments();

    return res.status(200).send({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  },
  async show(req, res) {
    const post = await Post.findById(req.params.id);

    return res.status(200).send(post);
  },
  async update(req, res) {
    const done = await Post.findByIdAndUpdate(req.params.id, {
      $set: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    return res.status(200).send();
  },
  async delete(req, res) {
    const { userID } = req;

    const post = await Post.findById(req.params.id);

    if (userID === post.author) {
      await Post.findByIdAndDelete(req.params.id);
      return res.status(200).send();
    }
  },
  // async like(req, res) {
  //   const post = await Post.findById(req.params.id);

  //   post.likes += 1;

  //   await post.save();

  //   return res.json(post);
  // },
  // Like a post
  async like(req, res) {
    const { userID } = req;
    const { id } = req.params;

    const post = await Post.findById(id);

    if (post.likes.includes(userID)) {
      post.likes.filter((like) => like !== userID);
      return res.status(200).send(post);
    }

    post.likes.push(userID);

    await post.save();

    return res.status(200).send(post);
  },
};
