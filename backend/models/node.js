import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Family Node Schema as a subdocument without its own _id.
const familyNodeSchema = new Schema({
  id: Number,
  name: String,
  gender: String,
  pids: [Number], // Partner IDs
  mid: Number,    // Mother's ID
  fid: Number     // Father's ID
}, { _id: false }); // Correctly disabling _id for subdocuments

// Define the Node Schema with _id enabled by default (remove _id: false for the main document schema)
const NodeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  familyTree: [familyNodeSchema]
});

const Node = mongoose.model('Node', NodeSchema);

export default Node;
