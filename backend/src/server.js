import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { initDb } from './config/db.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDb();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.resolve(__dirname, '../public')));

app.get('/', (req, res) => {
  res.json({ message: 'NexForm API' });
});

app.use('/api', apiRoutes);

app.listen(ENV.PORT, () => {
  console.log(`NexForm backend running on port ${ENV.PORT}`);
});
