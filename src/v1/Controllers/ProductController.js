const Product = require("../Models/Product");
const User = require("../Models/User");

const routes = {
  async store(req, res, next) {

    let imageURL = undefined;

    if (req.file) {
      const { location: url = "" } = req.file;

      imageURL = url;
    }

    const { userID } = req;
    const {
      title,
      description,
      price
    } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      image: imageURL,
      author: userID,
    });

    return res.status(200).send(newProduct);
  },
  async index(req, res) {
    const products = await Product.find({}).sort("-createdAt");
    return res.send(products);
  },
  async show(req, res) {
    const { productID } = req.params;

    const productDetails = await Product.findById(productID);

    return res.send(productDetails);
  },
  async delete(req, res) {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.send({
        error:
          "Nenhum produto encontrado com esse ID, talvez ele já tenha sido excluido",
      });
    }

    const fileUtils = new FileUtils();
    const fileName = product.image.split("/")[4];
    await fileUtils.deleteFile(fileName);

    await product.deleteOne();

    return res.send({
      done: "Produto excluido com sucesso",
    });
  },
};

module.exports = routes;
