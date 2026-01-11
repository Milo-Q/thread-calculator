import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// 获取统计数据
router.get('/', async (req, res) => {
  try {
    // 获取所有订单，包含计算数据和测量数据
    const orders = await prisma.order.findMany({
      include: {
        calculations: true,
        measurements: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 按服装种类和属性分组
    const groupedData: Record<string, Record<string, {
      orders: any[];
      totalSingleCost: number;
      count: number;
      measurements: Record<string, { total: number; count: number }>;
    }>> = {};

    orders.forEach((order) => {
      if (!groupedData[order.garmentType]) {
        groupedData[order.garmentType] = {};
      }
      if (!groupedData[order.garmentType][order.attribute]) {
        groupedData[order.garmentType][order.attribute] = {
          orders: [],
          totalSingleCost: 0,
          count: 0,
          measurements: {},
        };
      }

      const group = groupedData[order.garmentType][order.attribute];
      group.orders.push(order);
      group.count++;
      if (order.singleCost !== null) {
        group.totalSingleCost += order.singleCost;
      }

      // 统计测量数据
      order.measurements.forEach((measurement) => {
        if (measurement.measureValue !== null && measurement.measureValue > 0) {
          if (!group.measurements[measurement.process]) {
            group.measurements[measurement.process] = { total: 0, count: 0 };
          }
          group.measurements[measurement.process].total += measurement.measureValue;
          group.measurements[measurement.process].count++;
        }
      });
    });

    // 计算平均值
    const statistics: Array<{
      garmentType: string;
      attribute: string;
      averageSingleCost: number;
      orderCount: number;
      averageMeasurements: Record<string, number>;
    }> = [];

    Object.entries(groupedData).forEach(([garmentType, attributes]) => {
      Object.entries(attributes).forEach(([attribute, data]) => {
        const averageMeasurements: Record<string, number> = {};
        Object.entries(data.measurements).forEach(([process, stats]) => {
          averageMeasurements[process] = stats.count > 0 ? stats.total / stats.count : 0;
        });

        statistics.push({
          garmentType,
          attribute,
          averageSingleCost: data.count > 0 ? data.totalSingleCost / data.count : 0,
          orderCount: data.count,
          averageMeasurements,
        });
      });
    });

    res.json(statistics);
  } catch (error: any) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

