import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";
import bodyParser from "body-parser"; // Import bodyParser
import User from "./models/user.js";
// Assuming you've added bcrypt for password encryption
import bcrypt from 'bcrypt';
import cors from 'cors';
// const userRoutes = require('./routes/user')


// Import constants from a separate config file
// Alternatively, you can directly use the values here
const PORT = 3000;
const mongoDBURL =
  "mongodb+srv://admin:1234@famsnap.iaojsaa.mongodb.net/FamSnap?retryWrites=true&w=majority";

const app = express();
// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(cors());
app.use(bodyParser.json());

// Middleware function
app.use((req, res, next) => {
  console.log("This is a middleware function");
  console.log("Request method: ", req.method);
  console.log("Request URL: ", req.url);
  console.log("Request hostname: ", req.hostname);
  console.log("Request path: ", req.path);
  next();
});

// Connect to MongoDB
mongoose
  .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("FamSnap API is running...");
});

app.get("/login", (req, res) => {
  res.send("<p>You are in login get route</p>");
});


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
  res.status(200).send({ message: "Login successful", user: { email: user.email, id: user._id } }); // Optionally send back user details
});


app.get("/register", async (req, res) => {
  try {
    const user = new User({
      email: 'test@gmail.com',
      password: '1234',
    });

    const result = await user.save();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user");
  }
});

app.post("/register", async (req, res) => {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      birthday: req.body.birthday // Ensure your User model supports a 'birthday' field
    });

    const result = await user.save();
    res.status(201).send({ message: "User created successfully", userId: result._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user");
  }
});
