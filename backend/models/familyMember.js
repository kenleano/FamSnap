import mongoose from "mongoose";

const { Schema } = mongoose;

const familyMemberSchema = new Schema({
  _familyId: { type: Schema.Types.ObjectId, ref: "Family" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date },
  pid: { type: Schema.Types.ObjectId, ref: "FamilyMember" }, // Partner ID corrected
  mid: { type: Schema.Types.ObjectId, ref: "FamilyMember" }, // Mother ID
  fid: { type: Schema.Types.ObjectId, ref: "FamilyMember" }, // Father ID
  img: { type: String },
});

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);

export default FamilyMember;
