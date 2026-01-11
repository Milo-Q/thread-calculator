import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// 获取所有颜色
router.get('/', async (req, res) => {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(colors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 创建颜色
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '颜色名称不能为空' });
    }
    const color = await prisma.color.create({
      data: { name: name.trim() },
    });
    res.json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: '颜色名称已存在' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 更新颜色
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '颜色名称不能为空' });
    }
    const color = await prisma.color.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
    });
    res.json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: '颜色名称已存在' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 删除颜色
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.color.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: '删除成功' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ error: '该颜色正在使用中，无法删除' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;

