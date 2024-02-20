import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true } // Add the birthday field
});

const User = mongoose.model("User", userSchema);

export default User;
