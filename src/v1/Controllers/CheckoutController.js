require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const User = require("../Models/User");
const Product = require("../Models/Product");

const FRONTEND_URL = process.env.FRONTEND_URL;

module.exports = {
  async clientSecret(req, res, next) {
    const { userID } = req;

    console.log(userID);
    const { productId } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const product = await Product.findById(productId);

    const price = product.price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).send({ client_secret: paymentIntent.client_secret });
  },
  async createCheckoutSession(req, res, next) {
    const { userID } = req;
    const { productId } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const product = await Product.findById(productId);

    const price = product.price * 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: product.title,
            },
            unit_amount: price,
          },
          quantity: 5
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}?success=true`,
      cancel_url: `${FRONTEND_URL}?canceled=true`,
    });

    res.status(200).send({ redirectURL: session.url });
  },
  // async index(req, res){
  //   const posts = await Post.find().populate("author").sort("-createdAt");;

  //   return res.status(200).send(posts);
  // },
  // async show(req, res) {
  //   const post = await Post.findById(req.params.id);

  //   return res.status(200).send(post);
  // },
  // async update(req, res) {
  //   const done = await Post.findByIdAndUpdate(req.params.id, {
  //     $set: {
  //       ...req.body,
  //       updatedAt: new Date(),
  //     },
  //   });

  //   return res.status(200).send();
  // },
  // async delete(req, res) {

  //   const { userID } = req;

  //   const post = await Post.findById(req.params.id);

  //   if (userID === post.author) {
  //     await Post.findByIdAndDelete(req.params.id);
  //     return res.status(200).send();
  //   }
  // },
  // async like(req, res) {

  //   const post = await Post.findById(req.params.id);

  //   post.likes+=1;

  //   await post.save();

  //   return res.json(post);

  // }
};
