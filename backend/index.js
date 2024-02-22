import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import User from "./models/user.js";
import FamilyMember from "./models/familyMember.js";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";

import fs from "fs";
// const { json } = require('body-parser');
const { parsed: config } = dotenv.config();

const PORT = 3000;
const mongoDBURL =
  "mongodb+srv://admin:1234@famsnap.iaojsaa.mongodb.net/FamSnap?retryWrites=true&w=majority";

const app = express();
// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(mongoDBURL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const BASE_URL = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}`;
console.log(process.env.API_KEY + " and " + process.env.API_SECRET);
const auth = {
  username: process.env.API_KEY,
  password: process.env.API_SECRET,
};

app.get("/photos", async (req, res) => {
  const response = await axios.get(BASE_URL + "/resources/image", {
    auth,
    params: {
      next_cursor: req.query.next_cursor,
    },
  });
  return res.send(response.data);
});

app.get("/search", async (req, res) => {
  const response = await axios.get(BASE_URL + "/resources/search", {
    auth,
    params: {
      expression: req.query.expression,
    },
  });

  return res.send(response.data);
});

//UPLOAD:
// const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req.file); // Check if the file is received
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  try {
    const filePath = req.file.path;
    const cloudinaryResponse = await uploadToCloudinary(filePath);
    res.send(cloudinaryResponse);
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    res.status(500).send("Failed to upload image.");
  }
});

// Middleware function
app.use((req, res, next) => {
  console.log("This is a middleware function");
  console.log("Request method: ", req.method);
  console.log("Request URL: ", req.url);
  console.log("Request hostname: ", req.hostname);
  console.log("Request path: ", req.path);
  next();
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("FamSnap API is running...");
});

app.get("/login", (req, res) => {
  res.send("<p>You are in login get route</p>");
});

//Login
app.post("/login", async (req, res) => {
  // Find the user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("User not found");
  }
  // Check if the password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send("Invalid password");
  }
  res.status(200).send({
    message: "Login successful",
    user: {
      firstName: user.firstName, // Assuming these fields exist on your user model
      lastName: user.lastName,
      email: user.email,
      birthday: user.birthday,
      id: user._id,
    },
  });
});
//Register
app.post("/register", async (req, res) => {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      birthday: req.body.birthday, // Ensure your User model supports a 'birthday' field
    });

    const result = await user.save();
    res
      .status(201)
      .send({ message: "User created successfully", userId: result._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user");
  }
});

//FAMILY MEMBERS CRUD

// Create a new family member
app.post("/familymembers", async (req, res) => {
  try {
    const familyMember = new FamilyMember({
      ...req.body,
      _familyId: req.body._familyId, // Ensure this ID is passed in the request
    });
    await familyMember.save();
    res.status(201).send(familyMember);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all family members
app.get("/users/:userId/familymembers", async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({
      _familyId: req.params.userId,
    });
    res.status(200).send(familyMembers);
  } catch (error) {
    res.status(500).send(error);
  }
});


// Get a single family member by id
app.get("/familymembers/:id", async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.params.id);
    if (!familyMember) {
      return res.status(404).send();
    }
    res.status(200).send(familyMember);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a family member by id
app.patch("/familymembers/:id", async (req, res) => {
  try {
    const familyMember = await FamilyMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!familyMember) {
      return res.status(404).send();
    }
    res.status(200).send(familyMember);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a family member
app.delete("/familymembers/:id", async (req, res) => {
  try {
    const familyMember = await FamilyMember.findByIdAndDelete(req.params.id);
    if (!familyMember) {
      return res.status(404).send();
    }
    res.status(200).send(familyMember);
  } catch (error) {
    res.status(500).send(error);
  }
});
