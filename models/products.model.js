const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String },
    price: { type: Number },
    amount: { type: Number },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Product", productSchema);
