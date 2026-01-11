import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma';
import garmentRoutes from './routes/garments';
import colorRoutes from './routes/colors';
import orderRoutes from './routes/orders';
import materialRoutes from './routes/materials';
import calculationRoutes from './routes/calculations';
import exportRoutes from './routes/export';
import statisticsRoutes from './routes/statistics';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/garments', garmentRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '缝纫线计算器后端服务运行中' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

