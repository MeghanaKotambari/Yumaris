const mongoose = require("mongoose");
const Product = require("../models/product.model");

module.exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!name || price === undefined || !description || !category) {
      return res
        .status(400)
        .json({ message: "All product fields are required", success: false });
    }

    const product = await Product.create({
      name,
      price,
      description,
      category,
    });

    return res.status(201).json({
      message: "Product created successfully",
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1, _id: -1 });

    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid product id", success: false });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid product id", success: false });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    if (name !== undefined) {
      product.name = name;
    }
    if (price !== undefined) {
      product.price = price;
    }
    if (description !== undefined) {
      product.description = description;
    }
    if (category !== undefined) {
      product.category = category;
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid product id", success: false });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};
