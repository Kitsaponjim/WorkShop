const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    Username: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    FirstName: { type: String, required: true},
    LastName: { type: String, required: true},
    Role: { type: Number }, // 1 = admin, 0 = user
    StatusApprove: {type: Number}, // 1 = Approved, 0 = not approved
    Token: { type: String},
    img:{type: String},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
