var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/jwt_decode");
const decodeToken = require("../middleware/decodetoken");
const checkAdmin = require("../middleware/checkRole");
var mongoose = require("mongoose");
const Users = require("../models/users.model");
const productModel = require("../models/products.model");
const ordersModel = require("../models/orders.model");
const waitModel = require("../models/wait.model");

/*-----------------------------Approve-----------------------------*/
router.put("/v1/approve/:id", checkAdmin, async (req, res, next) => {
  try {
    let { StatusApprove } = req.body;
    let update = await Users.findByIdAndUpdate(
      req.params.id,
      { StatusApprove },
      { new: true }
    );
    return res.status(200).send({
      status: 200,
      message: "Approve Success",
      data: update,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Approve Fail",
    });
  }
});

// /*-----------------------------แสดงสมาชิกในระบบ-----------------------------*/
// router.get("/v1", async function (req, res, next) {
//   try {
//     let products = await Users.find();
//     return res.status(200).send({
//       status: 200,
//       message: "success",
//       data: products,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       status: 500,
//       message: "Fails to get",
//     });
//   }
// });

/*-----------------------------สมัครสมาชิก-----------------------------*/
router.post("/v1/register", async (req, res, next) => {
  try {
    const {
      Username,
      Password,
      FirstName,
      LastName,
      Role,
      StatusApprove,
      img,
    } = req.body;
    const checkUser = await Users.findOne({ Username });
    if (checkUser) {
      return res.status(400).send("User already exist. Please login");
    }
    let hashPassword = await bcrypt.hash(Password, 10);
    const newUser = new Users({
      Username: Username,
      Password: hashPassword,
      FirstName: FirstName,
      LastName: LastName,
      Role: Role,
      StatusApprove: 0,
      img: img,
    });
    const user = await newUser.save();
    return res.status(200).send({
      data: {
        _id: user._id,
        Username,
        FirstName,
        LastName,
        Role,
        StatusApprove,
        img,
      },
      message: "register success",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "register fail",
      success: false,
    });
  }
});

/*-----------------------------เข้าสู่ระบบ----------------------------- */
router.post("/v1/login", async (req, res, next) => {
  try {
    let { Username, Password } = req.body;
    let user = await Users.findOne({
      Username: Username,
    });
    if (!user) {
      return res.status(500).send({
        status: 500,
        message: "ไม่พบชื่อผู้ใช้ในระบบ, หากไม่มีบัญชีโปรดสมัคร",
      });
    }
    const checkPassword = await bcrypt.compare(Password, user.Password);
    if (!checkPassword) {
      return res.status(500).send({
        status: 500,
        message: "รหัสผ่านผิด",
        // success: false,
      });
    }
    const { _id, FirstName, LastName, Role, StatusApprove, img } = user;
    const Token = jwt.sign(
      { _id, Username, Role, StatusApprove, img },
      process.env.TOKEN_KEY,
      { expiresIn: "1d" }
    );
    return res.status(201).send({
      status: 201,
      message: "เข้าสู่ระบบได้ แต่เข้าไปในใจเธอไม่ได้หรอก",
      data: { _id, FirstName, LastName, Token },
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: "Login failed",
    });
  }
});

/*-----------------------------แสดงสินค้าทั้งหมด-----------------------------*/
router.get("/v1/products", async (req, res, next) => {
  try {
    // const { Username, _id } = req.user;
    // res.json({ Username, _id });
    let product = await productModel.find();
    return res.status(200).send({
      status: 200,
      message: "Get All Products Success",
      data: product,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Gat Product Fail",
    });
  }
});

/*-----------------------------แสดงสินค้าด้วย id-----------------------------*/
router.get("/v1/products/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        status: 400,
        message: "id invalid",
      });
    }
    let product = await productModel.findById(id);
    const { _id, product_name, amount, price, Type } = product;
    return res.status(200).send({
      status: 200,
      message: "Success",
      data: { _id, product_name, amount, price, Type },
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: "Gat Product Fail",
    });
  }
});

/*-----------------------------เพิ่มสินค้าในระบบ-----------------------------*/
router.post("/v1/products", async (req, res, next) => {
  try {
    const { product_name, amount, price, Type, img } = req.body;
    let newProduct = new productModel({
      product_name: product_name,
      amount: amount,
      price: price,
      Type: Type,
      img: img,
    });
    let product = await newProduct.save();
    return res.status(200).send({
      status: 200,
      message: "Add Product Success",
      data: product,
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: "Create Fail",
    });
  }
});

/*-----------------------------แก้ไขข้อมูลสินค้า-----------------------------*/
router.put("/v1/products/:id", async (req, res, next) => {
  try {
    let { product_name, amount, price, Type, img } = req.body;
    let update = await productModel.findByIdAndUpdate(
      req.params.id,
      { product_name, amount, price, Type, img },
      { new: true }
    );
    return res.status(200).send({
      status: 200,
      message: "Edit Product Success",
      data: update,
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: "Edit Fail",
    });
  }
});

/*-----------------------------ลบสินค้า-----------------------------*/
router.delete("/v1/products/:id", async (req, res, next) => {
  try {
    let delete_product = await productModel.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      status: 200,
      message: "Delete Product Success",
      delete_product,
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      message: "Delete Product Fail",
    });
  }
});

/*-----------------------------แสดงOrder-----------------------------*/
router.get("/v1/orders", async (req, res, next) => {
  try {
    let order = await ordersModel
      .find()
      .populate("productId")
      .populate("userId", "FirstName")
      .exec();
    return res.status(200).send({
      status: 200,
      message: "Get Orders Success",
      data: order,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Gat Orders Fail",
    });
  }
});

// /*-----------------------------เพิ่มOrder-----------------------------*/
// router.post("/v1/orders",  async (req, res, next) => {
//   console.log(req.body);
//   try {
//     const { productId, userId, quantity } = req.body;
//     let newOrder = new ordersModel({
//       productId: productId,
//       userId: userId,
//       quantity: quantity,
//     });
//     let order = await newOrder.save();
//     return res.status(200).send({
//       status: 200,
//       message: "Add Order Success",
//       data: order,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       status: 500,
//       message: "Add Fail",
//     });
//   }
// });

/*-----------------------------แสดง Order โดยใช้ id สินค้า ของสินค้า-----------------------------*/
router.get("/v1/products/:id/orders_P", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const orders = await ordersModel
      .find({ productId: productId })
      .populate("productId", "product_name")
      .populate("userId", "FirstName");
    return res.status(200).send({
      status: 200,
      message: "Get Orders Success",
      data: orders,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Get Orders Fail",
    });
  }
});

/*-----------------------------แสดง Order โดยใช้ id user ของสินค้า-----------------------------*/
router.get("/v1/products/:id/orders", async (req, res, next) => {
  try {
    const Users = req.params.id;
    const orders = await ordersModel
      .find({ userId: Users })
      .populate("productId")
      .populate("userId", "FirstName");
    return res.status(200).send({
      status: 200,
      message: "Get Orders Success",
      data: orders,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Get Orders Fail",
    });
  }
});
// router.get("/v1/products/:id/orders", async (req, res, next) => {
//   try {
//     const userId = req.user._id; // ใช้ user id ที่ได้จาก middleware
//     const orders = await ordersModel
//       .find({ userId: userId })
//       .populate("productId", "product_name")
//       .populate("userId", "FirstName");
//     return res.status(200).send({
//       status: 200,
//       message: "Get Orders Success",
//       data: orders,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).send({
//       status: 500,
//       message: "Get Orders Fail",
//     });
//   }
// });
/*-----------------------------เพิ่ม Order ของสินค้า โดยใช้ Product -----------------------------*/
// router.post("/v1/products/:id/orders_P",  async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const { quantity, userId } = req.body;
//     const product = await productModel.findById(productId);
//     /*ตรวจว่าสามารถสั่ง order ได้ไหม */
//     if (quantity > product.amount) {
//       return res.status(400).send({
//         status: 400,
//         message: "Order มากกว่าของที่มีใน stock ",
//       });
//     }
//     /* แก้ไขค่าของ amount*/
//     product.amount -= quantity;
//     totalprice = quantity * product.price
//     await product.save();

//     const newOrder = new ordersModel({
//       productId: productId,
//       quantity: quantity,
//       userId: userId,
//       totalprice: totalprice,
//     });
//     const order = await newOrder.save();
//     return res.status(200).send({
//       status: 200,
//       message: "Add Order Success",
//       data: order,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       status: 500,
//       message: "Add Order Fail",
//     });
//   }
// });

router.post("/v1/products/:id/orders", async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity, userId } = req.body;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).send({
        status: 404,
        message: "Product not found",
      });
    }

    // Check if there is an existing order with the same productId and userId
    const existingOrder = await ordersModel.findOne({
      productId: productId,
      userId: userId,
    });

    if (existingOrder) {
      // ProductId ซ้ำกันอยู่ในรายการสั่งซื้อที่มีอยู่แล้ว
      // ทำการรวมจำนวนสินค้า (amount) และราคารวม (totalprice)
      existingOrder.quantity += quantity;
      existingOrder.totalprice += quantity * product.price;
      await existingOrder.save();

      // ลดจำนวนสินค้าในสต็อก
      product.amount -= quantity;
      await product.save();

      return res.status(200).send({
        status: 200,
        message: "Order updated successfully",
        data: existingOrder,
      });
    }

    // ถ้าไม่พบรายการสั่งซื้อที่มี productId เดียวกัน ให้สร้างใหม่
    const totalprice = quantity * product.price;
    const newOrder = new ordersModel({
      productId: productId,
      quantity: quantity,
      userId: userId,
      totalprice: totalprice,
    });
    const order = await newOrder.save();

    // ลดจำนวนสินค้าในสต็อก
    product.amount -= quantity;
    await product.save();

    return res.status(200).send({
      status: 200,
      message: "Order added successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: 500,
      message: "Add Order Fail",
    });
  }
});

router.put("/v1/products/:id/orders", async (req, res, next) => {
  try {
    console.log( 'test'+req.params.id);
    let { quantity } = req.body;
    let update = await ordersModel.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    return res.status(200).send({
      status: 200,
      message: "Edit Product Success",
      data: update,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      message: "Edit Fail",
    });
  }
});

/*-----------------------------เพิ่ม Order ของสินค้า โดยใช้ Product-----------------------------*/
// router.post("/v1/products/:id/orders", async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const { quantity, userId } = req.body;
//     const product = await productModel.findById(productId);
//     /*ตรวจว่าสามารถสั่ง order ได้ไหม */
//     if (quantity > product.amount) {
//       return res.status(400).send({
//         status: 400,
//         message: "Order มากกว่าของที่มีใน stock ",
//       });
//     }
//     /* แก้ไขค่าของ amount*/
//     product.amount -= quantity;
//     totalprice = quantity * product.price;
//     await product.save();

//     const newOrder = new ordersModel({
//       productId: productId,
//       quantity: quantity,
//       userId: userId,
//       totalprice: totalprice,
//     });
//     const order = await newOrder.save();
//     return res.status(200).send({
//       status: 200,
//       message: "Add Order Success",
//       data: order,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       status: 500,
//       message: "Add Order Fail",
//     });
//   }
// });

/*-----------------------------รอเพิ่ม Order ของสินค้า-----------------------------*/
// router.post("/v1/products/:id/orderswait",  async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const { quantity, userId } = req.body;
//     const product = await productModel.findById(productId);
//     totalprice = quantity * product.price
//     await product.save();
//     const newOrder = new waitModel({
//       productId: productId,
//       quantity: quantity,
//       userId: userId,
//       totalprice:totalprice,
//     });
//     const order = await newOrder.save();
//     return res.status(200).send({
//       status: 200,
//       message: "Add Order Success",
//       data: order,
//     });
//   } catch (err) {
//     console.log(err)
//     return res.status(500).send({
//       status: 500,
//       message: "Add Order Fail",
//     });
//   }
// });

// router.get('/orders', async)
module.exports = router;
