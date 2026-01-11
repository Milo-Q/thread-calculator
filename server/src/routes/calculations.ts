import express from 'express';
import prisma from '../lib/prisma';
import {
  calculateUnitUsage,
  calculateRequiredQuantity,
  calculatePurchaseQuantity,
  calculatePurchaseAmount,
  calculateThreadCost,
  calculateSinglePieceCost,
  matchThreadType,
  formatDisplayPrecision,
} from '../services/calculationService';

const router = express.Router();

// 计算订单的所有核算数据
router.post('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderIdNum = parseInt(orderId);

    // 获取订单及相关数据
    const order = await prisma.order.findUnique({
      where: { id: orderIdNum },
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

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 删除旧的核算数据
    await prisma.calculation.deleteMany({
      where: { orderId: orderIdNum },
    });

    // 获取所有有测量数据的工艺
    const processesWithData = order.measurements.filter((m) => m.measureValue !== null && m.measureValue > 0);

    if (processesWithData.length === 0) {
      return res.status(400).json({ error: '至少需要输入一种工艺的测量数据' });
    }

    const calculations: any[] = [];
    const threadCostsByProcess: Record<string, number> = {};

    // 对每个工艺进行计算
    for (const measurement of processesWithData) {
      const { process, measureValue } = measurement;
      if (!measureValue || measureValue <= 0) continue;

      // 根据线种类匹配规则，确定该工艺使用的线单价和一轴线长度
      const threadMatch = matchThreadType(
        order.materials.map((m) => ({
          threadType: m.threadType,
          spoolLength: m.spoolLength,
          unitPrice: m.unitPrice,
        })),
        process
      );

      if (!threadMatch) {
        continue;
      }

      const { unitPrice, spoolLength } = threadMatch;

      // 计算单件用量
      const unitUsage = calculateUnitUsage(measureValue, process);

      // 计算该工艺的单位线费（单件用量 × 线单价 ÷ 一轴线长度）
      // 这样确保同一工艺下所有颜色的线费都相等
      const unitThreadCost = (unitUsage * unitPrice) / spoolLength;
      const commonThreadCost = Math.round(unitThreadCost * 100) / 100; // 保留2位小数

      // 对每个颜色进行计算
      for (const orderDetail of order.orderDetails) {
        const { colorId, quantity } = orderDetail;
        if (quantity <= 0) continue;

        // 计算需要线数量（保留2位小数）
        const requiredQty = calculateRequiredQuantity(unitUsage, spoolLength, quantity);

        // 计算采购金额（基于需要线数量，不使用向上取整）
        const purchaseAmount = calculatePurchaseAmount(requiredQty, unitPrice);

        // 使用统一的线费（确保同一工艺下所有颜色的线费相等）
        const threadCost = commonThreadCost;

        // 保存核算数据
        const calculation = await prisma.calculation.create({
          data: {
            orderId: orderIdNum,
            process,
            colorId,
            quantity,
            measureValue,
            unitUsage,
            spoolLength,
            requiredQty,
            unitPrice,
            purchaseAmount,
            threadCost,
          },
        });

        calculations.push(calculation);

        // 记录每个工艺的线费（用于后续计算单件线费）
        if (!threadCostsByProcess[process]) {
          threadCostsByProcess[process] = threadCost;
        }
      }
    }

    // 计算单件线费（所有工艺线费去重后求和）
    const threadCostsArray = Object.values(threadCostsByProcess);
    const singleCost = calculateSinglePieceCost(threadCostsArray);

    // 更新订单的单件线费
    await prisma.order.update({
      where: { id: orderIdNum },
      data: { singleCost },
    });

    // 返回计算结果
    const result = await prisma.order.findUnique({
      where: { id: orderIdNum },
      include: {
        calculations: {
          include: {
            order: {
              include: {
                orderDetails: {
                  include: {
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      order: result,
      calculations,
      singleCost: formatDisplayPrecision(singleCost, 2),
    });
  } catch (error: any) {
    console.error('计算错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取订单的核算数据
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const calculations = await prisma.calculation.findMany({
      where: { orderId: parseInt(orderId) },
      orderBy: [{ process: 'asc' }, { colorId: 'asc' }],
      include: {
        order: {
          include: {
            orderDetails: {
              include: {
                color: true,
              },
            },
          },
        },
      },
    });
    res.json(calculations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

