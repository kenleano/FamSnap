import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import treeRoutes from './routes/treeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/db.js';
import { cloudinaryConfig } from './config/cloudinaryConfig.js';

dotenv.config();
const app = express();
connectDB();
cloudinaryConfig();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/tree', treeRoutes);
app.use('/api/auth', authRoutes);

export default app;
