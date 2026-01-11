// 初始化数据库数据
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialGarmentTypes = [
  // 冲锋衣
  { typeName: '冲锋衣', attribute: '挂里', remark: '正常拼接挂里' },
  { typeName: '冲锋衣', attribute: '不挂里', remark: '封胶, 包边' },
  // 短裤
  { typeName: '短裤', attribute: '简单', remark: '2个口袋, 松紧腰' },
  { typeName: '短裤', attribute: '复杂', remark: '4-6个口袋, 松紧腰' },
  // 长裤
  { typeName: '长裤', attribute: '简单', remark: '2个口袋, 松紧腰' },
  { typeName: '长裤', attribute: '复杂', remark: '4-6个口袋, 松紧腰' },
  // 夹克
  { typeName: '夹克', attribute: '简单', remark: '正常拼接3个口袋内' },
  { typeName: '夹克', attribute: '复杂', remark: '拼接多, 口袋多' },
  // 短款棉衣
  { typeName: '短款棉衣', attribute: '珩线多', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  { typeName: '短款棉衣', attribute: '珩线少', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  // 长款棉衣
  { typeName: '长款棉衣', attribute: '珩线多', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  { typeName: '长款棉衣', attribute: '珩线少', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  // 棉马甲
  { typeName: '棉马甲', attribute: '珩线多', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  { typeName: '棉马甲', attribute: '珩线少', remark: '带帽/不带帽珩线少, 2-3个口袋' },
  // 皮肤衣
  { typeName: '皮肤衣', attribute: '简单', remark: '正常拼接挂里' },
  { typeName: '皮肤衣', attribute: '复杂', remark: '封胶, 包边' },
  // 马甲
  { typeName: '马甲', attribute: '简单', remark: '2个口袋, 拼接少' },
  { typeName: '马甲', attribute: '复杂', remark: '4-8个口袋, 拼接多' },
  // 工作服
  { typeName: '工作服', attribute: '简单', remark: '2个口袋, 拼接少' },
  { typeName: '工作服', attribute: '复杂', remark: '4-8个口袋, 拼接多' },
];

async function initData() {
  console.log('开始初始化数据...');

  try {
    // 检查是否已有数据
    const existingCount = await prisma.garmentType.count();
    if (existingCount > 0) {
      console.log('数据已存在，跳过初始化');
      return;
    }

    // 创建初始服装种类数据
    for (const garment of initialGarmentTypes) {
      await prisma.garmentType.create({
        data: garment,
      });
    }

    console.log(`成功初始化 ${initialGarmentTypes.length} 条服装种类数据`);
  } catch (error) {
    console.error('初始化数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initData()
  .then(() => {
    console.log('初始化完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('初始化失败:', error);
    process.exit(1);
  });

