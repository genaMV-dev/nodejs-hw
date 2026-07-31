import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errors } from 'celebrate';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(logger);

app.use(notesRoutes);
app.use(authRoutes);
app.use(userRoutes);

app.use(notFoundHandler);

app.use(errors());
app.use(errorHandler);
await connectMongoDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on: ${process.env.PORT || 3000}`);
});
