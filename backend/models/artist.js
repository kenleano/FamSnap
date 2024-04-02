import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true } // Assuming price is fixed; adjust if necessary
});

const historySchema = new mongoose.Schema({
  beforeImage: { type: String, required: true }, // URLs to images
  afterImage: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true }
});

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: false },
  date: { type: Date, required: true }
});

const artistSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is required and unique
  password: { type: String, required: true }, // Ensure password is required for security
  birthday: { type: Date, required: false },
  portfolio: [{ type: String }], // Assuming this is an array of image URLs
  services: [serviceSchema], // Use the schema defined above
  ratings: [reviewSchema], // Array of review schema for ratings and comments
  history: [historySchema] // Use the schema defined above for service history
});

const Artist = mongoose.model("Artist", artistSchema);

export default Artist; // Make sure this matches the model name
