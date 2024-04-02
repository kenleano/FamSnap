import bcrypt from 'bcrypt';
import Artist from '../models/artist.js';

export const registerArtist = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthday, portfolio, services, ratings, history } = req.body;

    // Check if user already exists
    const existingUser = await Artist.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newArtist = new Artist({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthday,
      portfolio,
      services,
      ratings,
      history
    });

    // Save user and return response
    const savedArtist = await newArtist.save();
    res.status(201).json(savedArtist);
  } catch (error) {
    res.status(500).json({ message: "Error registering new user", error: error.message });
  }
};
