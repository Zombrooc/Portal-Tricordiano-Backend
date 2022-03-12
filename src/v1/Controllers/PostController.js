require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");

const Post = require("../Models/Post");
const User = require("../Models/User");

module.exports = {
  async store(req, res, next) {
    if (!req.file) {
      return res.status(400).send({ error: "No file to be uploaded." });
    }

    const { userID } = req;
    const { title, content, hashtags } = req.body;
    const { key } = req.file;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const newPost = await Post.create({
      title,
      content,
      hashtags,
      image: `${process.env.APP_URL}/files/${key}`,
      author: userID,
    });

    return res.status(200).send(newPost);
  },
  async index(req, res){
    const posts = await Post.find().populate("author").sort("-createdAt");;

    return res.status(200).send(posts);
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
  async like(req, res) {
    
    const post = await Post.findById(req.params.id);

    post.likes+=1;

    await post.save();

    return res.json(post);

  }

};
