import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// 获取订单的所有原料信息
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const materials = await prisma.material.findMany({
      where: { orderId: parseInt(orderId) },
    });
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建原料信息
router.post('/', async (req, res) => {
  try {
    const { orderId, threadType, spoolLength, unitPrice } = req.body;
    
    // 数据验证
    if (!orderId) return res.status(400).json({ error: '订单ID不能为空' });
    if (!threadType || threadType.trim() === '') {
      return res.status(400).json({ error: '线种类不能为空' });
    }
    if (!spoolLength || spoolLength <= 0) {
      return res.status(400).json({ error: '一轴线长必须大于0' });
    }
    if (!unitPrice || unitPrice <= 0) {
      return res.status(400).json({ error: '线单价必须大于0' });
    }

    const material = await prisma.material.create({
      data: {
        orderId: parseInt(orderId),
        threadType: threadType.trim(),
        spoolLength: parseFloat(spoolLength),
        unitPrice: parseFloat(unitPrice),
      },
    });
    res.json(material);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新原料信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { threadType, spoolLength, unitPrice } = req.body;

    if (threadType && threadType.trim() === '') {
      return res.status(400).json({ error: '线种类不能为空' });
    }
    if (spoolLength !== undefined && spoolLength <= 0) {
      return res.status(400).json({ error: '一轴线长必须大于0' });
    }
    if (unitPrice !== undefined && unitPrice <= 0) {
      return res.status(400).json({ error: '线单价必须大于0' });
    }

    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: {
        ...(threadType && { threadType: threadType.trim() }),
        ...(spoolLength !== undefined && { spoolLength: parseFloat(spoolLength) }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
      },
    });
    res.json(material);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除原料信息
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

