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
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);
    
    // 检查是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // 允许所有Vercel域名
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // 允许自定义域名 xjyszy.cn
    if (origin.includes('xjyszy.cn')) {
      return callback(null, true);
    }
    
    // 其他情况拒绝
    callback(new Error('Not allowed by CORS'));
  },
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

