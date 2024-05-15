const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String },
    Type: {type: String},
    price: { type: Number },
    amount: { type: Number },
    img: {type: String},
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Product", productSchema);
