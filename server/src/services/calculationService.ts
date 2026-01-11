// 计算服务 - 核心业务逻辑

// 工艺计算公式倍数
const PROCESS_MULTIPLIERS: Record<string, number> = {
  '平车': 3,
  '三线': 12,
  '四线': 16,
  '五线': 19,
  '坎车': 20,
  '三针五线': 25,
};

/**
 * 计算单件用量
 * @param measureValue 测量数据（米）
 * @param process 工艺名称
 * @returns 单件用量（米）
 */
export function calculateUnitUsage(measureValue: number, process: string): number {
  const multiplier = PROCESS_MULTIPLIERS[process];
  if (!multiplier) {
    throw new Error(`未知的工艺类型: ${process}`);
  }
  
  // 计算公式: 测量数据 × 倍数 + 测量数据 × 倍数 × 0.2
  const baseUsage = measureValue * multiplier;
  const additionalUsage = baseUsage * 0.2;
  const unitUsage = baseUsage + additionalUsage;
  
  // 保留4位小数进行中间计算
  return Math.round(unitUsage * 10000) / 10000;
}

/**
 * 计算需要线数量
 * @param unitUsage 单件用量（米）
 * @param spoolLength 一轴线长度（米）
 * @param quantity 数量（件）
 * @returns 需要线数量（轴），保留2位小数
 */
export function calculateRequiredQuantity(
  unitUsage: number,
  spoolLength: number,
  quantity: number
): number {
  // 需要线数量 = 单件用量 ÷ 一轴线长度 × 数量
  const requiredQty = (unitUsage / spoolLength) * quantity;
  
  // 保留2位小数
  return Math.round(requiredQty * 100) / 100;
}

/**
 * 计算采购数量（向上取整）
 * @param requiredQty 需要线数量（轴）
 * @returns 采购数量（轴，整数）
 */
export function calculatePurchaseQuantity(requiredQty: number): number {
  // 向上取整
  return Math.ceil(requiredQty);
}

/**
 * 计算采购金额
 * @param requiredQty 需要线数量（轴，2位小数）
 * @param unitPrice 线单价（元/轴）
 * @returns 采购金额（元），保留2位小数
 */
export function calculatePurchaseAmount(
  requiredQty: number,
  unitPrice: number
): number {
  // 采购金额 = 需要线数量 × 线单价（不使用向上取整）
  const amount = requiredQty * unitPrice;
  
  // 保留2位小数
  return Math.round(amount * 100) / 100;
}

/**
 * 计算线费
 * @param purchaseAmount 采购金额（元）
 * @param quantity 数量（件）
 * @returns 线费（元），保留2位小数
 */
export function calculateThreadCost(
  purchaseAmount: number,
  quantity: number
): number {
  if (quantity === 0) {
    throw new Error('数量不能为0');
  }
  
  // 线费 = 采购金额 ÷ 数量
  const cost = purchaseAmount / quantity;
  
  // 保留2位小数
  return Math.round(cost * 100) / 100;
}

/**
 * 计算单件线费（所有工艺线费去重后求和）
 * @param threadCostsByProcess 按工艺分组的线费数组
 * @returns 单件线费（元）
 */
export function calculateSinglePieceCost(threadCostsByProcess: number[]): number {
  // 去重：同一工艺下不同颜色的线费应该相等，所以只需要取每个工艺的一个值
  const uniqueCosts = Array.from(new Set(threadCostsByProcess));
  
  // 求和
  const total = uniqueCosts.reduce((sum, cost) => sum + cost, 0);
  
  // 保留4位小数进行中间计算
  return Math.round(total * 10000) / 10000;
}

/**
 * 根据线种类匹配规则，确定每个工艺使用的线单价和一轴线长度
 * @param materials 原料信息数组
 * @param process 工艺名称
 * @returns { unitPrice: number, spoolLength: number } 或 null
 */
export function matchThreadType(
  materials: Array<{ threadType: string; spoolLength: number; unitPrice: number }>,
  process: string
): { unitPrice: number; spoolLength: number } | null {
  if (materials.length === 0) {
    return null;
  }

  // 规则一：只有平车线
  if (materials.length === 1 && materials[0].threadType === '平车线') {
    return {
      unitPrice: materials[0].unitPrice,
      spoolLength: materials[0].spoolLength,
    };
  }

  // 规则二：有平车线和丝光线（或其他线种类）
  const hasPlainThread = materials.some(m => m.threadType === '平车线');
  const hasSilkThread = materials.some(m => m.threadType === '丝光线');

  if (hasPlainThread && hasSilkThread) {
    if (process === '平车') {
      // 平车工艺使用平车线
      const plainThread = materials.find(m => m.threadType === '平车线');
      if (plainThread) {
        return {
          unitPrice: plainThread.unitPrice,
          spoolLength: plainThread.spoolLength,
        };
      }
    } else {
      // 其他工艺（三线、四线、五线、坎车、三针五线）使用丝光线
      const silkThread = materials.find(m => m.threadType === '丝光线');
      if (silkThread) {
        return {
          unitPrice: silkThread.unitPrice,
          spoolLength: silkThread.spoolLength,
        };
      }
    }
  }

  // 如果没有匹配的规则，返回第一个材料的信息（兜底）
  if (materials.length > 0) {
    return {
      unitPrice: materials[0].unitPrice,
      spoolLength: materials[0].spoolLength,
    };
  }

  return null;
}

/**
 * 格式化显示精度
 */
export function formatDisplayPrecision(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

