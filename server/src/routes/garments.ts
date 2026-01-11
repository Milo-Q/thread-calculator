import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// 获取所有服装种类
router.get('/', async (req, res) => {
  try {
    const garments = await prisma.garmentType.findMany({
      orderBy: [{ typeName: 'asc' }, { attribute: 'asc' }],
    });
    res.json(garments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 根据服装种类获取属性
router.get('/:typeName/attributes', async (req, res) => {
  try {
    const { typeName } = req.params;
    const garments = await prisma.garmentType.findMany({
      where: { typeName },
      select: {
        attribute: true,
        remark: true,
      },
      orderBy: { attribute: 'asc' },
    });
    res.json(garments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建服装种类
router.post('/', async (req, res) => {
  try {
    const { typeName, attribute, remark } = req.body;
    const garment = await prisma.garmentType.create({
      data: { typeName, attribute, remark },
    });
    res.json(garment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新服装种类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { typeName, attribute, remark } = req.body;
    const garment = await prisma.garmentType.update({
      where: { id: parseInt(id) },
      data: { typeName, attribute, remark },
    });
    res.json(garment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除服装种类
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.garmentType.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

