const Product = require("../models/productModel");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Seller = require("../models/SellerPanelModule/sellerModel");
const mongoose = require("mongoose");
require("dotenv").config();

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, trackQuantity, status, tags, discount = 0, rating, weight } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (!name || !category || !price || !stock || !description) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const imageUrls = req.files?.map(file => file.location) || [];
    const productTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map(tag => tag.trim())
      : [];

    const booleanStatus = status === "true" || status === true;

    const numericPrice = parseFloat(price);
    const numericDiscount = parseFloat(discount);

    const compareAtPrice = numericDiscount > 0
      ? +(numericPrice + (numericPrice * numericDiscount / 100)).toFixed(2)
      : null;

    const newProduct = new Product({
      name,
      category,
      price: numericPrice,
      compareAtPrice,
      stock,
      description,
      trackQuantity,
      status: booleanStatus,
      tags: productTags,
      seller: req.user.id,
      discount: numericDiscount,
      rating,
      weight,
      images: imageUrls,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product successfully added", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, trackQuantity, status, tags, discount = 0, rating, weight } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.files && req.files.length > 0) {
      for (const imageUrl of existingProduct.images) {
        const key = imageUrl.split(".com/")[1];
        if (key) {
          await s3.send(new DeleteObjectCommand({ Bucket: process.env.DO_SPACES_NAME, Key: key }));
        }
      }
    }

    const imageUrls = req.files?.map(file => file.location) || existingProduct.images;
    const updatedTags = Array.isArray(tags) ? tags : tags?.split(",").map(tag => tag.trim()) || existingProduct.tags;
    const booleanStatus = status === "true" || status === true;

    const numericPrice = parseFloat(price);
    const numericDiscount = parseFloat(discount);
    const compareAtPrice = numericDiscount > 0
      ? +(numericPrice + (numericPrice * numericDiscount / 100)).toFixed(2)
      : null;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price: numericPrice,
        compareAtPrice,
        stock,
        description,
        images: imageUrls,
        trackQuantity,
        status: booleanStatus,
        tags: updatedTags,
        discount: numericDiscount,
        rating,
        weight,
      },
      { new: true }
    );

    res.status(200).json({ message: "Product successfully updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (existingProduct.images?.length > 0) {
      for (const imageUrl of existingProduct.images) {
        const key = imageUrl.split(".com/")[1];
        if (key) {
          await s3.send(new DeleteObjectCommand({ Bucket: process.env.DO_SPACES_NAME, Key: key }));
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ message: "Seller products fetched successfully", products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true }).lean();
    res.status(200).json({ message: "Active products fetched successfully", products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching active products", error: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
   const { category } = req.params;
    const products = await Product.find({ category, status: true }).lean();
    res.status(200).json({ message: `${category} products fetched successfully`, products });
  } catch (error) {
    res.status(500).json({ message: `Error fetching products for category: ${category}`, error: error.message });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOne({ _id: id, status: true }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    res.status(200).json({ message: "Product fetched successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

const publishProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    const product = await Product.findOne({ _id: id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    product.status = !product.status;
    await product.save();

    res.status(200).json({ 
      message: `Product ${product.status ? "published" : "unpublished"} successfully`, 
      product 
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling product status", error: err.message });
  }
};

const isAdvertised = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isAdvertised = !product.isAdvertised;
    await product.save();

    res.status(200).json({ 
      message: `Product advertisement ${product.isAdvertised ? "enabled" : "disabled"} successfully`, 
      product 
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling advertisement", error: err.message });
  }
};

const getAdvertisedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAdvertised: true, status: true }).lean();
    res.status(200).json({ message: "Advertised products fetched successfully", products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching advertised products", error: error.message });
  }
};

module.exports = { addProduct, getAdvertisedProducts, isAdvertised, publishProduct, updateProduct, deleteProduct, getSellerProducts, getProductById, getActiveProducts, getProductsByCategory };