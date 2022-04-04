require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const User = require("../Models/User");
const Product = require("../Models/Product");

const FRONTEND_URL = process.env.FRONTEND_URL;

module.exports = {
  async clientSecret(req, res, next) {
    const { userID } = req;

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
    const { productId, quantity } = req.body;

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
              images: [product.image],
            },
            unit_amount: price,
          },
          quantity: quantity ? quantity : 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/payment?success=true`,
      cancel_url: `${FRONTEND_URL}/payment?canceled=true`,

      shipping_address_collection: {
        allowed_countries: ["BR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "brl",
            },
            display_name: "Entrega Grátis",
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 8 * 100,
              currency: "brl",
            },
            display_name: "Delivery (Motoboy)",
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 3,
              },
            },
          },
        },
      ],
    });

    res.status(200).send({ redirectURL: session.url });
  },
  async webhook(req, res, next) {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    let session
    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_succeeded":
        session = event.data.object;
        
        console.log(session)
        break;
      case "checkout.session.completed":
        session = event.data.object;
        
        console.log(session)
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).send();
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
