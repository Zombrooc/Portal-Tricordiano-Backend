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
      payment_method_types: ["card", "boleto"],
      // payment_method_options: {
      //   card: {
      //     request_three_d_secure: "automatic",
      //     installments: {
      //       enabled: true,
      //     },
      //   },
      //   boleto: {
      //     expires_after_days: 7,
      //     setup_future_usage: "on_session",
      //   },
      // },
    });

    return res.status(200).send({ clientSecret: paymentIntent.client_secret });
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
      customer_email: user.email,
      payment_method_types: ["card", "boleto"],
      customer_creation: "if_required",
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
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 10,
          },
          quantity: 1,
        },
      ],
      payment_method_options: {
        boleto: {
          expires_after_days: 7,
        },
      },
      billing_address_collection: "required",
      mode: "payment",
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      // success_url: `${FRONTEND_URL}/payment?success=true`,
      cancel_url: `${FRONTEND_URL}/payment?canceled=true`,
      submit_type: "pay",
      locale: "pt-BR",
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
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const endpointSecret = "whsec_lBaDKgnqP1KxUUYkGzNcwstbyPsTT8c0";
    var event = req.body;
    var session;
    var paymentIntent;

    if (endpointSecret) {
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400);
      }
    }
    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        session = event.data.object;
        console.log(session);
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case "checkout.session.async_payment_succeeded":
        session = event.data.object;
        console.log(session);
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        break;
      case "checkout.session.completed":
        session = event.data.object;
        console.log(session);
        // Then define and call a function to handle the event checkout.session.completed
        break;
      case "payment_intent.created":
        paymentIntent = event.data.object;
        console.log(paymentIntent);
        return res.send(paymentIntent)
        // Then define and call a function to handle the event payment_intent.created
        break;
      case "payment_intent.processing":
        paymentIntent = event.data.object;
        console.log(paymentIntent);
        // Then define and call a function to handle the event payment_intent.processing
        break;
      case "payment_intent.succeeded":
        paymentIntent = event.data.object;
        console.log(paymentIntent);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  },
};
