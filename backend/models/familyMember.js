import mongoose from "mongoose";

const { Schema } = mongoose;

const familyMemberSchema = new Schema({
  _familyId: { type: Schema.Types.ObjectId, ref: "Family" }, // Reference to a Family group if needed
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: false },
  relationships: {
    spouse: { type: Schema.Types.ObjectId, ref: "FamilyMember" }, // Reference to another FamilyMember document
    mother: { type: Schema.Types.ObjectId, ref: "FamilyMember" },
    father: { type: Schema.Types.ObjectId, ref: "FamilyMember" },
    siblings: [{ type: Schema.Types.ObjectId, ref: "FamilyMember" }], // An array of references for siblings
    children: [{ type: Schema.Types.ObjectId, ref: "FamilyMember" }], // An array of references for children
  },
});

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);

export default FamilyMember;
