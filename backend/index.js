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
  const { child, mother, father } = req.body;

  try {
    // Function to create a user
    const createUser = async (userData, familyId = null, isChild = false) => {
      const { email, password, ...rest } = userData;
      let hashedPassword = undefined;

      if (isChild && password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const user = new User({
        ...rest,
        email: isChild ? email : undefined,
        password: hashedPassword,
        // Set familyId for each member, if provided
        ...(familyId && { familyId }),
      });

      await user.save();
      return user;
    };

    // Step 1: Create the child record first but without setting familyId yet
    const childRecord = await createUser(child, null, true);

    // Use the child's ID as the familyId for all family members, including the child itself
    const familyId = childRecord._id;

    // Step 2: Create mother and father records with the child's ID as their familyId
    const motherRecord = await createUser(mother, familyId);
    const fatherRecord = await createUser(father, familyId);

    // Step 3: Link mother and father as partners
    await User.findByIdAndUpdate(motherRecord._id, {
      $set: { pid: fatherRecord._id, familyId: familyId },
    });
    // Step 4: Update the child record to set its familyId to its own _id
    //Update the record to have motherID and fatherID as mid and fid
    await User.findByIdAndUpdate(fatherRecord._id, {
      $set: { pid: motherRecord._id, familyId: familyId },
    });
    await User.findByIdAndUpdate(childRecord._id, {
      $set: {
        mid: motherRecord._id,
        fid: fatherRecord._id,
        familyId: familyId,
      },
    });

    // Respond with success and the IDs of the created records
    res.status(201).send({
      message: "Family registered successfully",
      ids: {
        childId: childRecord._id.toString(),
        motherId: motherRecord._id.toString(),
        fatherId: fatherRecord._id.toString(),
        familyId: familyId.toString(), // Send familyId as string for convenience
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Error registering family", error: err.message });
  }
});

// app.post("/register", async (req, res) => {
//   try {
//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const user = new User({
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       password: hashedPassword,
//       birthday: req.body.birthday, // Ensure your User model supports a 'birthday' field
//     });

//     const result = await user.save();
//     res
//       .status(201)
//       .send({ message: "User created successfully", userId: result._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error registering new user");
//   }
// });

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
    const user = await User.find({
      familyId: req.params.userId,
    });
    res.status(200).send(user);
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
