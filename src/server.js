import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/notesRoutes.js';
import { errors } from 'celebrate';

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use(router);

app.use(notFoundHandler);

app.use(errors());
app.use(errorHandler);
await connectMongoDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on: ${process.env.PORT || 3000}`);
});
