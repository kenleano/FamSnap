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
import { v2 as cloudinary } from "cloudinary";
 // This should be at the very top of your main file


import Replicate from "replicate";
import fs from "fs";
// const { json } = require('body-parser');
const { parsed: config } = dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// console.log(cloudinary);
// console.log(cloudinary.v2.uploader);


const PORT = 3000;
const mongoDBURL =
  "mongodb+srv://admin:1234@famsnap.iaojsaa.mongodb.net/FamSnap?retryWrites=true&w=majority";
// Just for testing purpose
cloudinary.uploader.add_tag(
  "example_tag",
  ["cgyrhcttclfnd8ia3wfi"],
  function (error, result) {
    if (error) console.log("Error:", error);
    else console.log("Result:", result);
  }
);


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

app.post("/restoreImage", async (req, res) => {
  const imageInput = req.body; // Assuming you send the necessary input as JSON from the frontend

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      version:
        "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      input: imageInput,
    }),
  });

  const data = await response.json();
  res.json(data); // Sending the response back to the frontend
});

app.get("/fetchImage/:imageId", async (req, res) => {
  const { imageId } = req.params;
  const imageUrl = `https://api.replicate.com/v1/predictions/${imageId}`;
  const imageResponse = await fetch(imageUrl, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });
  const imageData = await imageResponse.blob();
  res.type(imageResponse.headers.get("content-type"));
  res.send(imageData);
});

app.get("/checkStatus/:predictionId", async (req, res) => {
  const { predictionId } = req.params;
  const statusUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  try {
    const statusResponse = await fetch(statusUrl, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });
    const statusData = await statusResponse.json();

    // Optionally filter the response here if you want to limit what gets sent to the frontend
    res.json(statusData);
  } catch (error) {
    console.error("Failed to fetch prediction status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/colorizeImage", async (req, res) => {
  const imageInput = req.body; // Assuming you send the necessary input as JSON from the frontend

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      version:
        "0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950",
      input: imageInput,
    }),
  });

  const data = await response.json();
  res.json(data); // Sending the response back to the frontend
});

//Cloudinary API
const BASE_URL = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}`;

console.log(process.env.API_KEY + " and " + process.env.API_SECRET);
const auth = {
  username: process.env.API_KEY,
  password: process.env.API_SECRET,
};

//Get ALL PHOTOS
app.get("/photos", async (req, res) => {
  const response = await axios.get(BASE_URL + "/resources/image", {
    auth,
    params: {
      next_cursor: req.query.next_cursor,
    },
  });
  return res.send(response.data);
});

app.get("/albums", async (req, res) => {
  const response = await axios.get(BASE_URL + "/folders", {
    auth,
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

app.post("/addTagsToSingleAsset", async (req, res) => {
  const { tags, publicId } = req.body; // Expecting 'tags' and 'publicId' from the request body

  try {
    const result = await addTagsToSingleAsset(tags, publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error adding tags to asset:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const addTagsToSingleAsset = async (tags, publicId) => {
  try {
    const result = await cloudinary.uploader.add_tag(tags, [publicId]); // Note: [publicId] makes it an array
    console.log(result); // Log the result to see the updated asset information
    return result;
  } catch (error) {
    console.error("Error adding tags:", error);
    throw error; // Rethrow or handle error as needed
  }
};

app.post("/replaceTags", async (req, res) => {
  const { tags, publicId } = req.body; // Expecting 'tags' and 'publicId' from the request body

  try {
    const result = await replaceTags(tags, publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error replacing tags:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const replaceTags = async (tags, publicId) => {
  try {
    const result = await cloudinary.uploader.replace_tag(tags, [publicId]);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error replacing tags:", error);
    throw error;
  }
};

// Inside your routes or controller file
app.get('/photos/:publicId', async (req, res) => {
    try {
        const details = await getAssetDetails(req.params.publicId);
        res.json(details);
    } catch (error) {
        console.error("Error fetching asset details:", error);
        res.status(500).send(error.message);
    }
});

const getAssetDetails = async (publicId) => {
  try {
    // Fetch the details of the asset
    const result = await cloudinary.api.resource(publicId);
    console.log(result); // You can see all details of the asset here
    return result;
  } catch (error) {
    console.error("Error fetching asset details:", error);
    throw error;
  }
};

app.delete("/deletePhoto/:publicId", async (req, res) => {
  try {
    const result = await deleteImage(req.params.publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
}


// Replace 'your_public_id' with the actual public_id of the asset you want to fetch
// getAssetDetails("your_public_id").then((asset) => {
//   if (asset.tags && asset.tags.length > 0) {
//     console.log("Tags:", asset.tags);
//   } else {
//     console.log("No tags found for this asset.");
//   }
// });

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

// app.post("/upload", upload.single("image"), async (req, res) => {
//   console.log(req.file); // Check if the file is received
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }
//   try {
//     const filePath = req.file.path;
//     const cloudinaryResponse = await uploadToCloudinary(filePath);
//     res.send(cloudinaryResponse);
//   } catch (error) {
//     console.error("Upload to Cloudinary failed:", error);
//     res.status(500).send("Failed to upload image.");
//   }
// });

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  try {
    const filePath = req.file.path; // Path to the image file
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      categorization: "aws_rek_tagging",
      auto_tagging: 0.9,
    });
    res.send(cloudinaryResponse); // This response will include the auto-generated tags by Amazon Rekognition
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

//Get all
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

//Get one user
app.get("/getUser/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId)
      .populate("mid")
      .populate("fid")
      .populate("pid")
      .populate("familyId");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status.send(error.message);
  }
});

//Update user
app.put("/updateUser/:userId", async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a family member
app.delete("/familymembers/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

//FAMILY MEMBERS CRUD

// Create a new family member
app.post("/addfamily", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthday,
    familyId,
    mid,
    fid,
    pid,
  } = req.body;

  try {
    const newUser = new User({
      firstName,
      lastName,
      email, //
      birthday,
      familyId,
      mid,
      fid,
      pid,
    });
    await newUser.save(); // Save the new user document to the database
    res
      .status(201)
      .send({ message: "User added successfully", userId: newUser._id });
  } catch (error) {
    console.error("Error adding user:", error);
    res
      .status(500)
      .send({ message: "Error adding user", error: error.message });
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




app.get('/fulltree', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      const nodes = JSON.parse(data);
      res.json(nodes); // Send the nodes data as JSON
    }
  });
});

app.post('/fulltree', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      let nodes = JSON.parse(data);
      req.body.addNodesData.forEach(node => {
        nodes.push(node);
      });
      req.body.updateNodesData.forEach(node => {
        const index = nodes.findIndex(n => n.id === node.id);
        if (index > -1) {
          nodes[index] = node;
        }
      });
      nodes = nodes.filter(node => node.id !== req.body.removeNodeId);
      fs.writeFile('./db.json', JSON.stringify(nodes), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.json(nodes); // Send the updated nodes data as JSON
        }
      });
    }
  });
});