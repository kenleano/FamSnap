import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import User from "./models/user.js";
import Artist from "./models/artist.js";
import FamilyMember from "./models/familyMember.js";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Request from "./models/requests.js";
import Node from "./models/node.js";
import Stripe from 'stripe';
import Replicate from "replicate";
import fs from "fs";
const { parsed: config } = dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const PORT = 3000;

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
  .connect(process.env.mongoDBURL)
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

app.get('/albums/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      // Fetch albums from your storage, example with Cloudinary:
      const albums = await cloudinary.api.sub_folders(`user_${userId}`);

      // Optionally, fetch the first image for each album
      for (let folder of albums.folders) {
          const images = await cloudinary.api.resources({
              type: 'upload',
              prefix: folder.path, // Assuming images are stored by album path
              max_results: 1
          });
          folder.firstImageUrl = images.resources[0]?.secure_url || null;
      }

      res.send({ folders: albums.folders });
  } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).send("Failed to fetch albums");
  }
});


app.get('/albumdetails/:userId/:subfolder', async (req, res) => {
  const { userId, subfolder } = req.params;
  // Usually, you don't need to decode manually since Express does this automatically
  const encodedPath = encodeURIComponent(subfolder);
  const folderPath = `user_${userId}/${encodedPath}`;
  try {
      const result = await cloudinary.search
          .expression(`folder:${folderPath}`)
          .sort_by('public_id', 'desc')
          .max_results(30)
          .execute();

      res.json(result.resources);

      console.log("encodedPath", encodedPath);
      console.log("PATHLOG", folderPath);
      
  } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).send({ error: "Failed to fetch images" });
  }
});





app.get('/albumdetails', async (req, res) => {
  const { userId, subfolder } = req.query; // Use query parameters instead of URL path
  const folderPath = `${userId}/${subfolder}`;

  try {
      const result = await cloudinary.search
          .expression(`folder:${folderPath}`)
          .sort_by('public_id', 'desc')
          .max_results(30)
          .execute();

      res.json(result.resources);
  } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).send({ error: "Failed to fetch images" });
  }
});



app.post("/albums/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { albumName } = req.body;
  const folderPath = `user_${userId}/${albumName}`;

  try {
    // Example using Cloudinary SDK to create a folder
    const result = await cloudinary.api.create_folder(folderPath);
    res.send({ success: true, message: "Album created successfully", data: result });
  } catch (error) {
    res.status(500).send({ success: false, message: "Failed to create album", error: error.message });
  }
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
// Update the replaceTags endpoint to include the user's folder
app.post("/replaceTags/:userId", async (req, res) => {
  const { tags, publicId } = req.body; // Expecting 'tags' and 'publicId' from the request body
  const { userId } = req.params; // Extract the userId from the request parameters

  try {
    const result = await replaceTags(userId, tags, publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error replacing tags:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Function to replace tags for an image under a user's folder
const replaceTags = async (userId, tags, publicId) => {
  try {
    // Construct the full publicId including the user's folder
    const fullPublicId = `${publicId}`;
    const result = await cloudinary.uploader.replace_tag(tags, [fullPublicId]);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error replacing tags:", error);
    throw error;
  }
};

// Inside your routes or controller file
app.get("/photos/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Ensure that userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'No userId provided' });
    }
    const folderName = `${userId}`;

    // Use wildcard to include subfolders
    const searchExpression = `folder=user_${folderName}/*` || `folder=${folderName}`;

    // Fetch images from the specified folder and all subfolders
    const response = await cloudinary.search
      .expression(searchExpression)
      .sort_by('public_id', 'desc')  // Optional: sorts results by public_id in descending order
      .max_results(100)             // Optional: limits the number of results
      .execute();
    res.json(response.resources);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});



// Get photo details endpoint
app.get("/photodetail/:userId/:publicId(*)", async (req, res) => {
  try {
    const { userId, publicId } = req.params;
    const details = await getAssetDetails(userId, publicId);
    res.json(details);
  } catch (error) {
    console.error("Error fetching asset details:", error);
    res.status(500).send(error.message);
  }
});


// Function to get details of an asset from Cloudinary
const getAssetDetails = async (userId, publicId) => {
  try {
    // Fetch the details of the asset
    const result = await cloudinary.api.resource(`${userId}/${publicId}`);
    console.log(result); // You can see all details of the asset here
    return result;
  } catch (error) {
    console.error("Error fetching asset details:", error);
    throw error;
  }
};


app.delete("/deletePhoto/:userId/:publicId", async (req, res) => {
  try {
    const result = await deleteImage(req.params.userId, req.params.publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Function to delete image from Cloudinary
const deleteImage = async (userId, publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(`${userId}/${publicId}`);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
};


// Replace 'your_public_id' with the actual public_id of the asset you want to fetch
// getAssetDetails("your_public_id").then((asset) => {
//   if (asset.tags && asset.tags.length > 0) {
//     console.log("Tags:", asset.tags);
//   } else {
//     console.log("No tags found for this asset.");
//   }
// });

//`UPLOAD`:
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
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  try {
    const filePath = req.file.path; // Path to the image file
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      // categorization: "aws_rek_tagging",
      // auto_tagging: 0.9,
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

app.post("/register/artists", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if artist already exists
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return res.status(400).json({ message: "Artist already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new artist
    const newArtist = new Artist({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save artist
    await newArtist.save();

    res.status(201).json({ message: "Artist successfully registered" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering artist", error: error.message });
  }
});

app.post("/login/artists", async (req, res) => {
  // Find the user by email
  const user = await Artist.findOne({ email: req.body.email });
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
      email: user.email,
      birthday: user.birthday,
      id: user._id,
    },
  });
});

app.get("/getArtist/:artistId", async (req, res) => {
  const { artistId } = req.params;
  try {
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send("Artist not found");
    }
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/getAllArtists", async (req, res) => {
  try {
    const artists = await Artist.find();
    res.status(200).json(artists);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching artists", error: error.message });
  }
});

app.post("/addService", async (req, res) => {
  const { artistId, service } = req.body;

  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send("Artist not found");
    }

    artist.services.push(service);
    await artist.save();

    res.status(201).json({ message: "Service added successfully", artist });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete("/deleteService/:artistId/:serviceId", async (req, res) => {
  const { artistId, serviceId } = req.params;

  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send("Artist not found");
    }

    artist.services = artist.services.filter(
      (service) => service._id.toString() !== serviceId
    );
    await artist.save();

    res.status(200).json({ message: "Service deleted successfully", artist });
  } catch (error) {
    res.status(500).send(error.message);
  }
});



app.get("/getServices/:artistId", async (req, res) => {
  const { artistId } = req.params;
  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send("Artist not found");
    }
    res.status(200).json(artist.services);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/getPortfolio/:artistId", async (req, res) => {
  const { artistId } = req.params;
  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send("Artist not found");
    }
    res.status(200).json(artist.portfolio);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.delete("/deletePortfolio/:artistId/:index", async (req, res) => {
  const { artistId, index } = req.params;

  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send("Artist not found");
    }

    if (index < 0 || index >= artist.portfolio.length) {
      return res.status(400).send("Invalid index");
    }

    artist.portfolio.splice(index, 1);
    await artist.save();

    res.status(200).json({ message: "Image deleted successfully", artist });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Assuming Express is set up with bodyParser for JSON parsing
app.post("/portfolioUpload", async (req, res) => {
  const { artistId, imageUrl } = req.body;

  try {
    // Find the artist by ID and update their portfolio
    const updatedArtist = await Artist.findByIdAndUpdate(
      artistId,
      { $push: { portfolio: imageUrl } },
      { new: true } // Returns the updated document
    );

    if (!updatedArtist) {
      return res.status(404).send("Artist not found");
    }

    res.json({ message: "Portfolio updated successfully", updatedArtist });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating portfolio");
  }
});

app.get("/getRequests/:artistId", async (req, res) => {
  const { artistId } = req.params;
  try {
    const requests = await Request.find({ artistId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/getUserRequests/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const requests = await Request.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/requestService", async (req, res) => {
  // Initialize an array to hold processing results
  let results = [];

  // Check if the incoming request body is an array
  const requests = Array.isArray(req.body) ? req.body : [req.body];

  for (const request of requests) {
    const {
      artistId,
      userName,
      artistName,
      serviceName,
      servicePrice,
      userId,
      beforeImage,
      afterImage,
      date,
      message,
      status,
    } = request;

    try {
      // Verify the artist exists
      const artist = await Artist.findById(artistId);
      if (!artist) {
        results.push({ success: false, message: "Artist not found", artistId });
        continue; // Skip further processing for this request
      }

      // Create and save the new request
      const newRequest = new Request({
        userId,
        artistId,
        userName,
        artistName,
        serviceName,
        servicePrice,
        beforeImage,
        afterImage,
        message,
        date,
        status,
      });

      await newRequest.save();

      // Add success result for this request
      results.push({
        success: true,
        message: "Service request created successfully",
        request: newRequest,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      results.push({ success: false, message: error.message, artistId });
    }
  }

  // If only one request was processed, return its result directly
  if (requests.length === 1) {
    const result = results[0];
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result); // Adjust status code based on error type if needed
    }
  }

  // If multiple requests were processed, return the aggregate results
  return res.status(200).json(results);
});

app.post("/updateRequest/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const updateData = req.body;

  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).send("Request not found");
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

async function createFolderForUser(userId) {
  try {
    // Generate folder name based on user ID
    const folderName = `user_${userId}`;

    // Create folder on Cloudinary
    const result = await cloudinary.api.create_folder(folderName);

    console.log(`Folder created for user ${userId}: ${result.url}`);
  } catch (error) {
    console.error("Error creating folder:", error);
    // Handle error
  }
}

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

    await Promise.all([
      createUser(child, null, true), // Create the child record first but without setting familyId yet
    ]).then(([childRecord]) => {
      // Use the child's ID as the familyId for all family members, including the child itself
      const familyId = childRecord._id;

      // Create mother and father records with the child's ID as their familyId
      Promise.all([
        createUser(mother, familyId),
        createUser(father, familyId)
      ]).then(([motherRecord, fatherRecord]) => {
        // Link mother and father as partners in Node collection
        const parentNode = new Node({
          userId: childRecord._id,
          familyTree: [
            { id: motherRecord._id.toString(), name: `${mother.firstName} ${mother.lastName}`, gender: 'female', pids: [fatherRecord._id.toString()], mid: null, fid: null },
            { id: fatherRecord._id.toString(), name: `${father.firstName} ${father.lastName}`, gender: 'male', pids: [motherRecord._id.toString()], mid: null, fid: null },
            { id: childRecord._id.toString(), name: `${child.firstName} ${child.lastName}`, gender: child.gender, pids: [], mid: motherRecord._id.toString(), fid: fatherRecord._id.toString() }
          ]
        });
        parentNode.save();

        // Update the child record to set its familyId to its own _id
        User.findByIdAndUpdate(childRecord._id, {
          $set: {
            mid: motherRecord._id,
            fid: fatherRecord._id,
            familyId: familyId,
          },
        }).then(() => {
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
        }).catch(err => {
          console.error(err);
          res.status(500).send({ message: "Error updating child record", error: err.message });
        });
      }).catch(err => {
        console.error(err);
        res.status(500).send({ message: "Error creating mother and father records", error: err.message });
      });
    }).catch(err => {
      console.error(err);
      res.status(500).send({ message: "Error creating child record", error: err.message });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error registering family", error: err.message });
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
app.get('/getUser/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error instanceof mongoose.Error.ConnectionError) {
      return res.status(503).send('Database connection error');
    }
    res.status(500).send('Internal Server Error');
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

function updateDbJson(data) {
  fs.writeFile("./db.json", JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.error(err);
    }
  });
}





app.get("/familytree/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find the node with the specified userId
    const node = await Node.findOne({ userId });

    if (!node) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the familyTree from the node
    const familyTree = node.familyTree;

    // Send the familyTree in the response
    res.status(200).json(familyTree);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: err.message });
  }
});



app.post('/writetree', async (req, res) => {
  const { userId, familyTree } = req.body;

  if (!userId || !familyTree) {
    return res.status(400).send('Missing userId or familyTree data');
  }

  try {
    // Create a new Node document
    const newNode = new Node({
      userId: userId,
      familyTree: familyTree
    });

    // Save the document
    const savedNode = await newNode.save();

    // Send back the created document
    res.status(201).json(savedNode);
  } catch (error) {
    console.error('Failed to save the family tree:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/writeToFile', (req, res) => {
  const newData = req.body;
  let familyTreeData = [];
  familyTreeData.push(newData);

  // Trim the outermost brackets by taking the first element of the first (and only) element of the familyTreeData
  const trimmedData = JSON.stringify(familyTreeData[0]);

  fs.writeFile('db.json', trimmedData, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Error writing to file' });
    }
    res.json({ message: 'Data written to file successfully' });
  });
});


// Endpoint to delete content from db.json
app.delete('/deleteFileContent', (req, res) => {
  let familyTreeData = "";
  fs.writeFile('./db.json', '', (err) => {
    if (err) {
      console.error('Error deleting file content:', err);
      return res.status(500).json({ message: 'Error deleting file content' });
    }
    res.json({ message: 'File content deleted successfully' });
  });
});




app.get("/jsontree", (req, res) => {
  fs.readFile("./db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      const nodes = JSON.parse(data);
      res.json(nodes); // Send the nodes data as JSON
    }
  });
});

app.post("/jsontree", (req, res) => {
  
  fs.readFile("./db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      let nodes = JSON.parse(data);
      req.body.addNodesData.forEach((node) => {
        nodes.push(node);
      });
      req.body.updateNodesData.forEach((node) => {
        const index = nodes.findIndex((n) => n.id === node.id);
        if (index > -1) {
          nodes[index] = node;
        }
      });
      nodes = nodes.filter((node) => node.id !== req.body.removeNodeId);
      fs.writeFile("./db.json", JSON.stringify(nodes), "utf8", (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else {
          res.json(nodes); // Send the updated nodes data as JSON
        }
      });
    }
  });
});



app.post("/updateFamilyTree/:userId", async (req, res) => {
  const userId = req.params.userId;

  fs.readFile('db.json', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading from file:', err);
      return res.status(500).json({ message: 'Error reading from file' });
    }
  
    try {
      // Assuming db.json contains an array of family tree data
      let newFamilyTree = JSON.parse(data);
  
      // Find the node for the specified userId and update it
      const node = await Node.findOne({ userId: userId });
      if (!node) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update the node with new family tree data
      node.familyTree = newFamilyTree;  // Set the new family tree without the extra nesting
      await node.save();  // Save the updated node
  
    } catch (updateError) {
      console.error('Error updating the family tree:', updateError);
      res.status(500).json({ message: updateError.message });
    }
  });
});

app.delete('/deleteAlbum/:userId/:albumPath', async (req, res) => {
  try {
    const { userId, albumPath } = req.params;
    const folderPath = decodeURIComponent(albumPath);  // Assuming the folder path is encoded

    // Cloudinary API to delete a folder
    const result = await cloudinary.api.delete_folder(`user_${userId}/${folderPath}`);

    res.send({ success: true, message: 'Album deleted successfully', result });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/process_payment', async (req, res) => {
  const { paymentMethodId, total } = req.body; // total should be in cents
  const returnUrl = 'https://localhost:3000/download-image';  // Replace with your actual return URL

  try {
      const paymentIntent = await stripe.paymentIntents.create({
          amount: total,
          currency: 'usd',
          payment_method: paymentMethodId,
          confirmation_method: 'automatic',
          confirm: true,
          return_url: returnUrl,  // Include this to specify where to redirect after payment
      });

      if (paymentIntent.status === 'succeeded') {
          res.json({ success: true, downloadToken: "your-secure-token-or-url" });
      } else {
          res.status(400).json({ success: false, message: "Payment failed" });
      }
  } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


app.post("/addBankInfo", async (req, res) => {
  const { userId, bankInfo } = req.body;
  try {
    // Assuming you have a 'User' model and you want to add bank info to it
    const artist = await Artist.findById(userId);

    if (!artist) {
      return res.status(404).send("User not found");
    }

    // Add bank info to user's payment details
    artist.paymentDetails.push({
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      routingNumber: bankInfo.routingNumber,
      accountType: bankInfo.accountType,
      accountHolderName: bankInfo.accountHolderName,
      paymentMethod: "Bank Transfer", // Assuming it's bank transfer
    });

    await artist.save();

    res.status(200).send("Bank info added successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/getBankInfo/:artistId", async (req, res) => {
  const { artistId } = req.params;
  try {
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send("Artist not found");
    }

    const bankInfo = artist.paymentDetails.map(payment => ({
      _id: payment._id,
      bankName: payment.bankName,
      accountNumber: payment.accountNumber,
      routingNumber: payment.routingNumber,
      accountType: payment.accountType,
      accountHolderName: payment.accountHolderName
    }));

    res.status(200).json(bankInfo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete("/deleteBankInfo/:artistId/:paymentId", async (req, res) => {
  const { artistId, paymentId } = req.params;
  try {
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send("Artist not found");
    }

    artist.paymentDetails.pull({ _id: paymentId });
    await artist.save();

    res.status(200).send("Bank info deleted successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


