import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { initDb } from './config/db.js';
import apiRoutes from './routes/index.js';

initDb();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'NexForm API' });
});

app.use('/api', apiRoutes);

app.listen(ENV.PORT, () => {
  console.log(`NexForm backend running on port ${ENV.PORT}`);
});
