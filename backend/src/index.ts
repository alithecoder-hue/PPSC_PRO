import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import fs from 'fs';
import path from 'path';

app.use(helmet());
// CORS was open to any origin (audit H11). Only the real frontends may call
// this API: the Vercel deployment, the custom domain, and local dev.
const ALLOWED_ORIGINS = [
  'https://ppsc-pro.vercel.app',
  'https://meritmaster.pk',
  'https://www.meritmaster.pk',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

// Rate limiting (audit H11): auth endpoints are the brute-force surface,
// so they get the strictest budget; the general API gets a looser one.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again in 15 minutes' },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again shortly' },
});
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

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
