const mongoose = require("mongoose");
const Product = require('./products.model');
const User = require('./users.model');

const ordersSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    quantity: { type: Number },
    totalprice: { type: Number}
  },
  { 
    timestamps: true,
  }
  
);

module.exports = mongoose.model("Order", ordersSchema);
