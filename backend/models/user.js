import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  email: { type: String, required: false },
  password: { type: String, required: false },
  birthday: { type: Date, required: false },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Family's ID
  mid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Mother's ID
  fid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Father's ID
  pid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Partner's ID
});
userSchema.path("email").index({ unique: true, sparse: true }); // Add this line

const User = mongoose.model("User", userSchema);

export default User;
