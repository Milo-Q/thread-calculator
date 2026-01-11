import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garmentApi, GarmentType } from '../api/garments';
import { colorApi, Color } from '../api/colors';
import { orderApi, CreateOrderData, Order, Calculation } from '../api/orders';
import ColorManager from '../components/ColorManager';

const PROCESSES = ['平车', '三线', '四线', '五线', '坎车', '三针五线'];
const THREAD_TYPES = ['平车线', '丝光线']; // 固定的线种类选项

export default function HomePage() {
  const queryClient = useQueryClient();
  const [selectedGarmentType, setSelectedGarmentType] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [materials, setMaterials] = useState<Array<{ threadType: string; spoolLength: string; unitPrice: string }>>([
    { threadType: '', spoolLength: '', unitPrice: '' },
  ]);
  const [orderDetails, setOrderDetails] = useState<Array<{ colorId: number; quantity: string }>>([
    { colorId: 0, quantity: '' },
  ]);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  // 折叠状态管理
  const [expandedProcesses, setExpandedProcesses] = useState<Record<string, boolean>>({});
  const [expandedPurchaseProcesses, setExpandedPurchaseProcesses] = useState<Record<string, boolean>>({});

  // 获取服装种类
  const { data: garmentTypesData } = useQuery<GarmentType[]>({
    queryKey: ['garmentTypes'],
    queryFn: () => garmentApi.getAll(),
  });
  const garmentTypes: GarmentType[] = garmentTypesData || [];

  // 获取属性
  const { data: attributesData } = useQuery<Array<{ attribute: string; remark: string }>>({
    queryKey: ['attributes', selectedGarmentType],
    queryFn: () => garmentApi.getAttributes(selectedGarmentType),
    enabled: !!selectedGarmentType,
  });
  const attributes: Array<{ attribute: string; remark: string }> = attributesData || [];

  // 获取颜色
  const { data: colorsData } = useQuery<Color[]>({
    queryKey: ['colors'],
    queryFn: () => colorApi.getAll(),
  });
  const colors: Color[] = colorsData || [];

  // 创建订单
  const createOrderMutation = useMutation<Order, Error, CreateOrderData>({
    mutationFn: (data: CreateOrderData) => orderApi.create(data),
    onSuccess: (order: Order) => {
      setCurrentOrder(order);
      alert('订单创建成功！');
    },
  });

  // 计算订单
  const calculateMutation = useMutation({
    mutationFn: (orderId: number) => orderApi.calculate(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', currentOrder?.id] });
      alert('计算完成！');
    },
  });

  // 当选择属性时，自动填充备注
  useEffect(() => {
    if (selectedAttribute && attributes.length > 0) {
      const attr = attributes.find((a) => a.attribute === selectedAttribute);
      if (attr) {
        setRemark(attr.remark);
      }
    }
  }, [selectedAttribute, attributes]);

  const handleAddMaterial = () => {
    setMaterials([...materials, { threadType: '', spoolLength: '', unitPrice: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, field: string, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  const handleAddOrderDetail = () => {
    setOrderDetails([...orderDetails, { colorId: 0, quantity: '' }]);
  };

  const handleRemoveOrderDetail = (index: number) => {
    setOrderDetails(orderDetails.filter((_, i) => i !== index));
  };

  const handleOrderDetailChange = (index: number, field: string, value: string | number) => {
    const newOrderDetails = [...orderDetails];
    newOrderDetails[index] = { ...newOrderDetails[index], [field]: value };
    setOrderDetails(newOrderDetails);
  };

  const handleMeasurementChange = (process: string, value: string) => {
    setMeasurements({ ...measurements, [process]: value });
  };

  const handleCalculate = async () => {
    // 验证数据
    if (!selectedGarmentType) {
      alert('请选择服装种类');
      return;
    }
    if (!selectedAttribute) {
      alert('请选择属性');
      return;
    }
    if (materials.some((m) => !m.threadType || !m.spoolLength || !m.unitPrice)) {
      alert('请完整填写原料信息');
      return;
    }
    if (orderDetails.some((od) => !od.colorId || !od.quantity || parseFloat(od.quantity) <= 0)) {
      alert('请完整填写订单详情');
      return;
    }
    const hasMeasurement = PROCESSES.some((p) => measurements[p] && parseFloat(measurements[p]) > 0);
    if (!hasMeasurement) {
      alert('至少需要输入一种工艺的测量数据');
      return;
    }

    // 创建或更新订单
    const orderData: CreateOrderData = {
      garmentType: selectedGarmentType,
      attribute: selectedAttribute,
      remark,
      materials: materials.map((m) => ({
        threadType: m.threadType,
        spoolLength: parseFloat(m.spoolLength),
        unitPrice: parseFloat(m.unitPrice),
      })),
      orderDetails: orderDetails.map((od) => ({
        colorId: od.colorId,
        quantity: parseInt(od.quantity),
      })),
      measurements: PROCESSES.map((p) => ({
        process: p,
        measureValue: measurements[p] && parseFloat(measurements[p]) > 0 ? parseFloat(measurements[p]) : null,
      })),
    };

    if (currentOrder) {
      // 更新订单
      await orderApi.update(currentOrder.id, orderData);
      const updatedOrder = await orderApi.getById(currentOrder.id);
      setCurrentOrder(updatedOrder as Order);
      // 计算
      await calculateMutation.mutateAsync(currentOrder.id);
      // 重新获取订单数据
      const finalOrder = await orderApi.getById(currentOrder.id);
      setCurrentOrder(finalOrder as Order);
    } else {
      // 创建新订单
      const order = await createOrderMutation.mutateAsync(orderData);
      // 计算
      await calculateMutation.mutateAsync(order.id);
      // 重新获取订单数据
      const finalOrder = await orderApi.getById(order.id);
      setCurrentOrder(finalOrder);
    }
  };

  const handleExport = () => {
    if (!currentOrder) {
      alert('请先计算订单');
      return;
    }
    orderApi.exportExcel(currentOrder.id);
  };

  // 根据工艺判断使用的线种类
  const getThreadTypeByProcess = (process: string, materials: any[]): string | null => {
    if (materials.length === 0) return null;
    
    // 规则一：只有平车线
    if (materials.length === 1 && materials[0].threadType === '平车线') {
      return '平车线';
    }
    
    // 规则二：有平车线和丝光线
    const hasPlainThread = materials.some((m: any) => m.threadType === '平车线');
    const hasSilkThread = materials.some((m: any) => m.threadType === '丝光线');
    
    if (hasPlainThread && hasSilkThread) {
      if (process === '平车') {
        return '平车线';
      } else {
        // 其他工艺（三线、四线、五线、坎车、三针五线）使用丝光线
        return '丝光线';
      }
    }
    
    // 兜底：返回第一个材料的线种类
    return materials[0]?.threadType || null;
  };

  // 获取采购数量数据（按工艺分组）
  const getPurchaseData = () => {
    if (!currentOrder?.calculations) return {};
    const grouped: Record<string, Calculation[]> = {};
    currentOrder.calculations.forEach((calc) => {
      if (!grouped[calc.process]) {
        grouped[calc.process] = [];
      }
      grouped[calc.process].push(calc);
    });
    return grouped;
  };

  // 获取按线种类统计的采购数量数据
  const getPurchaseDataByThreadType = () => {
    if (!currentOrder?.calculations || !currentOrder?.materials) return {};
    
    const grouped: Record<string, Array<{ colorName: string; quantity: number; amount: number }>> = {};
    
    currentOrder.calculations.forEach((calc) => {
      const threadType = getThreadTypeByProcess(calc.process, currentOrder.materials);
      if (!threadType) return;
      
      const color = currentOrder.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
      const colorName = color?.name || '';
      const purchaseQty = Math.ceil(calc.requiredQty); // 向上取整
      const purchaseAmount = purchaseQty * calc.unitPrice;
      
      if (!grouped[threadType]) {
        grouped[threadType] = [];
      }
      
      // 检查该颜色是否已存在，如果存在则累加
      const existingIndex = grouped[threadType].findIndex((item) => item.colorName === colorName);
      if (existingIndex >= 0) {
        grouped[threadType][existingIndex].quantity += purchaseQty;
        grouped[threadType][existingIndex].amount += purchaseAmount;
      } else {
        grouped[threadType].push({
          colorName,
          quantity: purchaseQty,
          amount: purchaseAmount,
        });
      }
    });
    
    return grouped;
  };

  const purchaseData = getPurchaseData();
  const purchaseDataByThreadType = getPurchaseDataByThreadType();

  // 获取核算数据（按工艺分组）
  const getCalculationDataByProcess = () => {
    if (!currentOrder?.calculations) return {};
    const grouped: Record<string, Calculation[]> = {};
    currentOrder.calculations.forEach((calc) => {
      if (!grouped[calc.process]) {
        grouped[calc.process] = [];
      }
      grouped[calc.process].push(calc);
    });
    return grouped;
  };

  const calculationDataByProcess = getCalculationDataByProcess();

  // 切换工艺折叠状态
  const toggleProcess = (process: string) => {
    setExpandedProcesses((prev) => ({
      ...prev,
      [process]: !prev[process],
    }));
  };

  // 切换采购数量工艺折叠状态
  const togglePurchaseProcess = (process: string) => {
    setExpandedPurchaseProcesses((prev) => ({
      ...prev,
      [process]: !prev[process],
    }));
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>创建订单并计算</h1>

      {/* 颜色管理 */}
      <ColorManager />

      {/* 订单信息 */}
      <div className="card">
        <h2 className="card-title">订单信息</h2>
        <div className="form-group">
          <label className="form-label">服装种类</label>
          <select
            className="form-select"
            value={selectedGarmentType}
            onChange={(e) => {
              setSelectedGarmentType(e.target.value);
              setSelectedAttribute('');
              setRemark('');
            }}
          >
            <option value="">请选择</option>
            {Array.from(new Set(garmentTypes.map((g: GarmentType) => g.typeName))).map((typeName: string) => (
              <option key={typeName} value={typeName}>
                {typeName}
              </option>
            ))}
          </select>
        </div>
        {selectedGarmentType && (
          <div className="form-group">
            <label className="form-label">属性</label>
            <select
              className="form-select"
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value)}
            >
              <option value="">请选择</option>
              {attributes.map((attr, index) => (
                <option key={index} value={attr.attribute}>
                  {attr.attribute}
                </option>
              ))}
            </select>
          </div>
        )}
        {remark && (
          <div className="form-group">
            <label className="form-label">备注</label>
            <input className="form-input" type="text" value={remark} readOnly />
          </div>
        )}
      </div>

      {/* 原料信息 */}
      <div className="card">
        <h2 className="card-title">原料信息</h2>
        {materials.map((material, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={material.threadType}
              onChange={(e) => handleMaterialChange(index, 'threadType', e.target.value)}
            >
              <option value="">请选择线种类</option>
              {THREAD_TYPES.map((type) => {
                // 检查该线种类是否已被其他行选择（除了当前行）
                const isUsed = materials.some((m, i) => i !== index && m.threadType === type);
                return (
                  <option key={type} value={type} disabled={isUsed}>
                    {type}{isUsed ? ' (已选择)' : ''}
                  </option>
                );
              })}
            </select>
            <input
              className="form-input"
              style={{ width: '150px' }}
              type="number"
              placeholder="一轴线长（米）"
              value={material.spoolLength}
              onChange={(e) => handleMaterialChange(index, 'spoolLength', e.target.value)}
            />
            <input
              className="form-input"
              style={{ width: '150px' }}
              type="number"
              placeholder="线单价（元/轴）"
              value={material.unitPrice}
              onChange={(e) => handleMaterialChange(index, 'unitPrice', e.target.value)}
            />
            {materials.length > 1 && (
              <button className="btn btn-danger" onClick={() => handleRemoveMaterial(index)}>
                删除
              </button>
            )}
          </div>
        ))}
        {materials.length < THREAD_TYPES.length && (
          <button className="btn btn-secondary" onClick={handleAddMaterial}>
            添加线种类
          </button>
        )}
      </div>

      {/* 订单详情 */}
      <div className="card">
        <h2 className="card-title">订单详情</h2>
        {orderDetails.map((detail: { colorId: number; quantity: string }, index: number) => (
          <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={detail.colorId}
              onChange={(e) => handleOrderDetailChange(index, 'colorId', parseInt(e.target.value))}
            >
              <option value="0">请选择颜色</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
            <input
              className="form-input"
              style={{ width: '150px' }}
              type="number"
              placeholder="数量（件）"
              value={detail.quantity}
              onChange={(e) => handleOrderDetailChange(index, 'quantity', e.target.value)}
            />
            {orderDetails.length > 1 && (
              <button className="btn btn-danger" onClick={() => handleRemoveOrderDetail(index)}>
                删除
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-secondary" onClick={handleAddOrderDetail}>
          添加颜色
        </button>
      </div>

      {/* 测量数据 */}
      <div className="card">
        <h2 className="card-title">测量数据</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {PROCESSES.map((process) => (
            <div key={process} className="form-group">
              <label className="form-label">{process}（米）</label>
              <input
                className="form-input"
                type="number"
                placeholder="请输入测量数据"
                value={measurements[process] || ''}
                onChange={(e) => handleMeasurementChange(process, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          style={{ marginRight: '12px' }}
          onClick={handleCalculate}
          disabled={createOrderMutation.isPending || calculateMutation.isPending}
        >
          {createOrderMutation.isPending || calculateMutation.isPending ? '计算中...' : '计算'}
        </button>
        {currentOrder && (
          <button className="btn btn-secondary" onClick={handleExport}>
            导出Excel
          </button>
        )}
      </div>

      {/* 计算结果 */}
      {currentOrder && (
        <>
          {currentOrder.singleCost !== null && (
            <div className="card" style={{ background: '#e7f3ff', border: '2px solid #007bff' }}>
              <h2 style={{ color: '#007bff', marginBottom: '8px' }}>单件线费</h2>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                ¥{currentOrder.singleCost.toFixed(2)}
              </p>
            </div>
          )}

          {/* 核算数据表格（按工艺折叠） */}
          {Object.keys(calculationDataByProcess).length > 0 && (
            <div className="card">
              <h2 className="card-title">核算数据</h2>
              {Object.entries(calculationDataByProcess).map(([process, calcs]) => {
                const isExpanded = expandedProcesses[process] ?? false;
                return (
                  <div key={process} style={{ marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
                      }}
                      onClick={() => toggleProcess(process)}
                    >
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{process}</h3>
                      <span style={{ fontSize: '18px', color: '#666' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{ overflow: 'auto' }}>
                        <table className="table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>颜色</th>
                              <th>数量（件）</th>
                              <th>测量数据（米）</th>
                              <th>单件用量（米）</th>
                              <th>一轴线长度（米）</th>
                              <th>需要线数量（轴）</th>
                              <th>线单价（元/轴）</th>
                              <th>采购金额（元）</th>
                              <th>线费（元）</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calcs.map((calc) => {
                              const color = currentOrder?.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
                              return (
                                <tr key={calc.id}>
                                  <td>{color?.name || ''}</td>
                                  <td>{calc.quantity}</td>
                                  <td>{calc.measureValue || ''}</td>
                                  <td>{calc.unitUsage?.toFixed(2) || ''}</td>
                                  <td>{calc.spoolLength}</td>
                                  <td>{calc.requiredQty.toFixed(2)}</td>
                                  <td>{calc.unitPrice}</td>
                                  <td>{calc.purchaseAmount.toFixed(2)}</td>
                                  <td>{calc.threadCost.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 采购数量统计（按线种类分组） */}
          {Object.keys(purchaseDataByThreadType).length > 0 && (
            <div className="card">
              <h2 className="card-title">采购数量统计（按线种类）</h2>
              {Object.entries(purchaseDataByThreadType).map(([threadType, items]) => {
                const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
                return (
                  <div key={threadType} style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px', color: '#007bff' }}>{threadType}采购统计</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>颜色</th>
                          <th>数量（轴，向上取整）</th>
                          <th>金额（元）</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.colorName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', background: '#e7f3ff' }}>
                          <td>合计</td>
                          <td>{totalQty}</td>
                          <td>{totalAmount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* 采购数量表格（按工艺分组，可折叠） */}
          {Object.keys(purchaseData).length > 0 && (
            <div className="card">
              <h2 className="card-title">采购数量</h2>
              {Object.entries(purchaseData).map(([process, calcs]) => {
                const isExpanded = expandedPurchaseProcesses[process] ?? false;
                const totalQty = calcs.reduce((sum, calc) => sum + Math.ceil(calc.requiredQty), 0);
                const totalAmount = calcs.reduce(
                  (sum, calc) => sum + Math.ceil(calc.requiredQty) * calc.unitPrice,
                  0
                );
                return (
                  <div key={process} style={{ marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
                      }}
                      onClick={() => togglePurchaseProcess(process)}
                    >
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{process}采购数量</h3>
                      <span style={{ fontSize: '18px', color: '#666' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{ overflow: 'auto' }}>
                        <table className="table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>颜色</th>
                              <th>数量（轴，向上取整）</th>
                              <th>金额（元）</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calcs.map((calc) => {
                              const color = currentOrder?.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
                              const purchaseQty = Math.ceil(calc.requiredQty);
                              const purchaseAmount = purchaseQty * calc.unitPrice;
                              return (
                                <tr key={calc.id}>
                                  <td>{color?.name || ''}</td>
                                  <td>{purchaseQty}</td>
                                  <td>{purchaseAmount.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                            <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                              <td>合计</td>
                              <td>{totalQty}</td>
                              <td>{totalAmount.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

