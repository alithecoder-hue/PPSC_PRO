import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import fs from 'fs';
import path from 'path';

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

import authRoutes from './routes/authRoutes';
import mcqRoutes from './routes/mcqRoutes';
import adminRoutes from './routes/adminRoutes';
import billingRoutes from './routes/billingRoutes';
import publicRoutes from './routes/publicRoutes';
import premiumRoutes from './routes/premiumRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', billingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/premium', premiumRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
