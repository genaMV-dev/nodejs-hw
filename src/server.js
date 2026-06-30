import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import pinoHttp from 'pino-http';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.get('/notes', (req, res) => {
  req.log.info('All notes');
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  req.log.info(`Note by id: ${noteId}`);
  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on: ${process.env.PORT || 3000}`);
});
