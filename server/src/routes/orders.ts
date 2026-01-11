import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// 获取所有订单（历史订单查询）
router.get('/', async (req, res) => {
  try {
    const { garmentType, startDate, endDate, keyword } = req.query;
    
    const where: any = {};
    if (garmentType) {
      where.garmentType = garmentType as string;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }
    if (keyword) {
      where.OR = [
        { garmentType: { contains: keyword as string } },
        { attribute: { contains: keyword as string } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        materials: true,
        orderDetails: {
          include: {
            color: true,
          },
        },
        calculations: true,
      },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个订单详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        materials: true,
        orderDetails: {
          include: {
            color: true,
          },
        },
        measurements: true,
        calculations: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建订单
router.post('/', async (req, res) => {
  try {
    const { garmentType, attribute, remark, materials, orderDetails, measurements } = req.body;

    // 数据验证
    if (!garmentType) return res.status(400).json({ error: '服装种类不能为空' });
    if (!attribute) return res.status(400).json({ error: '属性不能为空' });
    if (!materials || materials.length === 0) {
      return res.status(400).json({ error: '至少需要配置一种线种类' });
    }
    if (!orderDetails || orderDetails.length === 0) {
      return res.status(400).json({ error: '至少需要添加一种颜色的订单详情' });
    }

    // 创建订单及相关数据
    const order = await prisma.order.create({
      data: {
        garmentType,
        attribute,
        remark: remark || '',
        materials: {
          create: materials.map((m: any) => ({
            threadType: m.threadType,
            spoolLength: parseFloat(m.spoolLength),
            unitPrice: parseFloat(m.unitPrice),
          })),
        },
        orderDetails: {
          create: orderDetails.map((od: any) => ({
            colorId: parseInt(od.colorId),
            quantity: parseInt(od.quantity),
          })),
        },
        measurements: {
          create: measurements.map((m: any) => ({
            process: m.process,
            measureValue: m.measureValue ? parseFloat(m.measureValue) : null,
          })),
        },
      },
      include: {
        materials: true,
        orderDetails: {
          include: {
            color: true,
          },
        },
        measurements: true,
      },
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新订单
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { garmentType, attribute, remark, materials, orderDetails, measurements } = req.body;

    // 先删除旧的关联数据
    await prisma.material.deleteMany({ where: { orderId: parseInt(id) } });
    await prisma.orderDetail.deleteMany({ where: { orderId: parseInt(id) } });
    await prisma.measurement.deleteMany({ where: { orderId: parseInt(id) } });
    await prisma.calculation.deleteMany({ where: { orderId: parseInt(id) } });

    // 更新订单
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        garmentType,
        attribute,
        remark: remark || '',
        singleCost: null, // 重置单件线费，需要重新计算
        materials: {
          create: materials.map((m: any) => ({
            threadType: m.threadType,
            spoolLength: parseFloat(m.spoolLength),
            unitPrice: parseFloat(m.unitPrice),
          })),
        },
        orderDetails: {
          create: orderDetails.map((od: any) => ({
            colorId: parseInt(od.colorId),
            quantity: parseInt(od.quantity),
          })),
        },
        measurements: {
          create: measurements.map((m: any) => ({
            process: m.process,
            measureValue: m.measureValue ? parseFloat(m.measureValue) : null,
          })),
        },
      },
      include: {
        materials: true,
        orderDetails: {
          include: {
            color: true,
          },
        },
        measurements: true,
      },
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Prisma会自动级联删除关联数据（由于设置了onDelete: Cascade）
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

