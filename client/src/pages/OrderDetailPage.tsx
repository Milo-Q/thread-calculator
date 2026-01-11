import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, Calculation } from '../api/orders';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 折叠状态管理（必须在组件顶层）
  const [expandedProcesses, setExpandedProcesses] = useState<Record<string, boolean>>({});
  const [expandedPurchaseProcesses, setExpandedPurchaseProcesses] = useState<Record<string, boolean>>({});

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(parseInt(id!)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => orderApi.delete(parseInt(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
      alert('删除成功！');
    },
  });

  const calculateMutation = useMutation({
    mutationFn: () => orderApi.calculate(parseInt(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      alert('计算完成！');
    },
  });

  const handleDelete = () => {
    if (window.confirm('确定要删除这个订单吗？')) {
      deleteMutation.mutate();
    }
  };

  const handleExport = () => {
    orderApi.exportExcel(parseInt(id!));
  };

  const handleCalculate = async () => {
    await calculateMutation.mutateAsync();
  };

  if (isLoading) {
    return <div className="container">加载中...</div>;
  }

  if (!order) {
    return <div className="container">订单不存在</div>;
  }

  // 获取按线种类统计的采购数量数据
  const getPurchaseDataByThreadType = () => {
    if (!order.calculations || !order.materials) return {};
    
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

    const grouped: Record<string, Array<{ colorName: string; quantity: number; amount: number }>> = {};
    
    order.calculations.forEach((calc) => {
      const threadType = getThreadTypeByProcess(calc.process);
      if (!threadType) return;
      
      const color = order.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
      const colorName = color?.name || '';
      const purchaseQty = Math.ceil(calc.requiredQty);
      const purchaseAmount = purchaseQty * calc.unitPrice;
      
      if (!grouped[threadType]) {
        grouped[threadType] = [];
      }
      
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

  const purchaseDataByThreadType = getPurchaseDataByThreadType();

  // 获取核算数据（按工艺分组）
  const getCalculationDataByProcess = () => {
    if (!order.calculations) return {};
    const grouped: Record<string, Calculation[]> = {};
    order.calculations.forEach((calc) => {
      if (!grouped[calc.process]) {
        grouped[calc.process] = [];
      }
      grouped[calc.process].push(calc);
    });
    return grouped;
  };

  // 获取采购数量数据（按工艺分组）
  const getPurchaseData = () => {
    if (!order.calculations) return {};
    const grouped: Record<string, Calculation[]> = {};
    order.calculations.forEach((calc) => {
      if (!grouped[calc.process]) {
        grouped[calc.process] = [];
      }
      grouped[calc.process].push(calc);
    });
    return grouped;
  };

  const calculationDataByProcess = getCalculationDataByProcess();
  const purchaseData = getPurchaseData();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>订单详情</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
            返回列表
          </button>
          <button className="btn btn-primary" onClick={handleCalculate} disabled={calculateMutation.isPending}>
            {calculateMutation.isPending ? '计算中...' : '重新计算'}
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            导出详细订单
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/orders/${id}/edit`)}>
            编辑
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
            删除
          </button>
        </div>
      </div>

      {/* 订单基本信息 */}
      <div className="card">
        <h2 className="card-title">订单信息</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <strong>订单编号：</strong>
            <span>{order.id}</span>
          </div>
          <div>
            <strong>服装种类：</strong>
            <span>{order.garmentType}</span>
          </div>
          <div>
            <strong>属性：</strong>
            <span>{order.attribute}</span>
          </div>
          <div>
            <strong>备注：</strong>
            <span>{order.remark}</span>
          </div>
          <div>
            <strong>单件线费：</strong>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              {order.singleCost !== null ? `¥${order.singleCost.toFixed(2)}` : '-'}
            </span>
          </div>
          <div>
            <strong>创建时间：</strong>
            <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

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
                        {calcs.map((calc, index) => {
                          const color = order.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
                          return (
                            <tr key={index}>
                              <td>{color?.name || ''}</td>
                              <td>{calc.quantity}</td>
                              <td>{calc.measureValue || '-'}</td>
                              <td>{calc.unitUsage?.toFixed(2) || '-'}</td>
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
                        {calcs.map((calc, index) => {
                          const color = order.orderDetails.find((od) => od.colorId === calc.colorId)?.color;
                          const purchaseQty = Math.ceil(calc.requiredQty);
                          const purchaseAmount = purchaseQty * calc.unitPrice;
                          return (
                            <tr key={index}>
                              <td>{color?.name || ''}</td>
                              <td>{purchaseQty}</td>
                              <td>{purchaseAmount.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ fontWeight: 'bold', background: '#e7f3ff' }}>
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

      {/* 其他详细信息可以在这里添加 */}
      <div className="card">
        <h2 className="card-title">其他信息</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <strong>原料信息：</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {order.materials.map((m) => (
                <li key={m.id}>
                  {m.threadType} - 一轴线长：{m.spoolLength}米 - 线单价：{m.unitPrice}元/轴
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>订单详情：</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {order.orderDetails.map((od) => (
                <li key={od.id}>
                  {od.color?.name || '未知颜色'} - {od.quantity}件
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

