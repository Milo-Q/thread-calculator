import express from 'express';
import prisma from '../lib/prisma';
import * as XLSX from 'xlsx';
import { formatDisplayPrecision } from '../services/calculationService';

const router = express.Router();

// 导出订单为Excel
router.get('/order/:orderId/excel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderIdNum = parseInt(orderId);

    // 获取订单完整信息
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
        calculations: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // Sheet 1: 订单信息
    const orderInfoData = [
      ['订单编号', order.id],
      ['服装种类', order.garmentType],
      ['属性', order.attribute],
      ['备注', order.remark],
      ['单件线费', formatDisplayPrecision(order.singleCost || 0, 2)],
      ['创建时间', order.createdAt.toLocaleString('zh-CN')],
      ['更新时间', order.updatedAt.toLocaleString('zh-CN')],
    ];
    const orderInfoSheet = XLSX.utils.aoa_to_sheet(orderInfoData);
    XLSX.utils.book_append_sheet(workbook, orderInfoSheet, '订单信息');

    // Sheet 2: 原料信息
    const materialData = [
      ['线种类', '一轴线长（米）', '线单价（元/轴）'],
      ...order.materials.map((m) => [
        m.threadType,
        m.spoolLength,
        m.unitPrice,
      ]),
    ];
    const materialSheet = XLSX.utils.aoa_to_sheet(materialData);
    XLSX.utils.book_append_sheet(workbook, materialSheet, '原料信息');

    // Sheet 3: 订单详情
    const orderDetailData = [
      ['颜色', '数量（件）'],
      ...order.orderDetails.map((od) => [od.color.name, od.quantity]),
    ];
    const orderDetailSheet = XLSX.utils.aoa_to_sheet(orderDetailData);
    XLSX.utils.book_append_sheet(workbook, orderDetailSheet, '订单详情');

    // Sheet 4: 测量数据
    const measurementData = [
      ['工艺', '测量数据（米）'],
      ...order.measurements.map((m) => [
        m.process,
        m.measureValue || '',
      ]),
    ];
    const measurementSheet = XLSX.utils.aoa_to_sheet(measurementData);
    XLSX.utils.book_append_sheet(workbook, measurementSheet, '测量数据');

    // Sheet 5: 核算数据
    const calculationData = [
      [
        '工艺',
        '颜色',
        '数量（件）',
        '测量数据（米）',
        '单件用量（米）',
        '一轴线长度（米）',
        '需要线数量（轴）',
        '线单价（元/轴）',
        '采购金额（元）',
        '线费（元）',
      ],
      ...order.calculations.map((c) => {
        const color = order.orderDetails.find((od) => od.colorId === c.colorId)?.color;
        return [
          c.process,
          color?.name || '',
          c.quantity,
          c.measureValue || '',
          formatDisplayPrecision(c.unitUsage || 0, 2),
          c.spoolLength,
          formatDisplayPrecision(c.requiredQty, 2),
          c.unitPrice,
          formatDisplayPrecision(c.purchaseAmount, 2),
          formatDisplayPrecision(c.threadCost, 2),
        ];
      }),
    ];
    const calculationSheet = XLSX.utils.aoa_to_sheet(calculationData);
    XLSX.utils.book_append_sheet(workbook, calculationSheet, '核算数据');

    // Sheet 6: 采购数量（按工艺分组）
    const processes = Array.from(new Set(order.calculations.map((c) => c.process)));
    for (const process of processes) {
      const processCalculations = order.calculations.filter((c) => c.process === process);
      const purchaseData = [
        [`${process}采购数量`],
        ['颜色', '采购数量（轴，向上取整）', '金额（元）'],
        ...processCalculations.map((c) => {
          const color = order.orderDetails.find((od) => od.colorId === c.colorId)?.color;
          const purchaseQty = Math.ceil(c.requiredQty);
          const purchaseAmount = purchaseQty * c.unitPrice;
          return [
            color?.name || '',
            purchaseQty,
            formatDisplayPrecision(purchaseAmount, 2),
          ];
        }),
      ];

      // 添加合计行
      const totalQty = processCalculations.reduce((sum, c) => sum + Math.ceil(c.requiredQty), 0);
      const totalAmount = processCalculations.reduce(
        (sum, c) => sum + Math.ceil(c.requiredQty) * c.unitPrice,
        0
      );
      purchaseData.push(['合计', totalQty, formatDisplayPrecision(totalAmount, 2)]);

      const purchaseSheet = XLSX.utils.aoa_to_sheet(purchaseData);
      XLSX.utils.book_append_sheet(workbook, purchaseSheet, `${process}采购数量`);
    }

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // 设置响应头
    const fileName = `订单_${order.id}_${order.createdAt.toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('导出错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 导出订单列表为Excel
router.get('/orders/excel', async (req, res) => {
  try {
    const { garmentType, keyword } = req.query;
    
    const where: any = {};
    if (garmentType) {
      where.garmentType = garmentType as string;
    }
    if (keyword) {
      where.OR = [
        { garmentType: { contains: keyword as string } },
        { attribute: { contains: keyword as string } },
      ];
    }

    // 获取所有订单
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

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 订单列表数据
    const orderListData = [
      [
        '订单编号',
        '服装种类',
        '属性',
        '备注',
        '单件线费（元）',
        '数量（件）',
        '平车线数量（轴）',
        '平车线金额（元）',
        '丝光线数量（轴）',
        '丝光线金额（元）',
      ],
      ...orders.map((order) => {
        // 计算订单总件数（所有颜色总和）
        const totalQuantity = order.orderDetails.reduce((sum, od) => sum + od.quantity, 0);

        // 计算按线种类的采购统计
        const getThreadTypeByProcess = (process: string): string | null => {
          if (order.materials.length === 0) return null;
          if (order.materials.length === 1 && order.materials[0].threadType === '平车线') {
            return '平车线';
          }
          const hasPlainThread = order.materials.some((m) => m.threadType === '平车线');
          const hasSilkThread = order.materials.some((m) => m.threadType === '丝光线');
          if (hasPlainThread && hasSilkThread) {
            if (process === '平车') return '平车线';
            return '丝光线';
          }
          return order.materials[0]?.threadType || null;
        };

        const plainThreadSummary = { totalQty: 0, totalAmount: 0 };
        const silkThreadSummary = { totalQty: 0, totalAmount: 0 };

        if (order.calculations && order.calculations.length > 0) {
          order.calculations.forEach((calc) => {
            const threadType = getThreadTypeByProcess(calc.process);
            if (threadType === '平车线') {
              const purchaseQty = Math.ceil(calc.requiredQty);
              const purchaseAmount = purchaseQty * calc.unitPrice;
              plainThreadSummary.totalQty += purchaseQty;
              plainThreadSummary.totalAmount += purchaseAmount;
            } else if (threadType === '丝光线') {
              const purchaseQty = Math.ceil(calc.requiredQty);
              const purchaseAmount = purchaseQty * calc.unitPrice;
              silkThreadSummary.totalQty += purchaseQty;
              silkThreadSummary.totalAmount += purchaseAmount;
            }
          });
        }

        return [
          order.id,
          order.garmentType,
          order.attribute,
          order.remark,
          order.singleCost !== null ? formatDisplayPrecision(order.singleCost, 2) : '',
          totalQuantity,
          plainThreadSummary.totalQty,
          formatDisplayPrecision(plainThreadSummary.totalAmount, 2),
          silkThreadSummary.totalQty,
          formatDisplayPrecision(silkThreadSummary.totalAmount, 2),
        ];
      }),
    ];

    const orderListSheet = XLSX.utils.aoa_to_sheet(orderListData);
    XLSX.utils.book_append_sheet(workbook, orderListSheet, '订单列表');

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // 设置响应头
    const fileName = `订单列表_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('导出错误:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

