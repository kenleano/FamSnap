import express from 'express';
import { registerArtist } from '../controllers/artistController.js';

const router = express.Router();

// Registration route
router.post('/register/artists', registerArtist);

export default router;
