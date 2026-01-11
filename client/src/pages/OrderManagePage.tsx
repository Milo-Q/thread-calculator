import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, Order } from '../api/orders';

export default function OrderManagePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState('');
  const [expandedGarmentTypes, setExpandedGarmentTypes] = useState<Record<string, boolean>>({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', searchKeyword, selectedGarmentType],
    queryFn: () =>
      orderApi.getAll({
        keyword: searchKeyword || undefined,
        garmentType: selectedGarmentType || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('删除成功！');
    },
  });

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个订单吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (id: number) => {
    navigate(`/orders/${id}`);
  };

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/orders/${id}/edit`);
  };

  const handleExportList = () => {
    orderApi.exportOrdersList({
      garmentType: selectedGarmentType || undefined,
      keyword: searchKeyword || undefined,
    });
  };

  // 获取按线种类统计的采购总数和金额
  const getPurchaseSummaryByThreadType = (order: Order) => {
    const defaultSummary = {
      平车线: { totalQty: 0, totalAmount: 0 },
      丝光线: { totalQty: 0, totalAmount: 0 },
      hasData: false,
    };

    if (!order.calculations || order.calculations.length === 0 || !order.materials || order.materials.length === 0) {
      return defaultSummary;
    }

    const getThreadTypeByProcess = (process: string): string | null => {
      const materials = order.materials!;
      if (materials.length === 0) return null;
      if (materials.length === 1 && materials[0].threadType === '平车线') {
        return '平车线';
      }
      const hasPlainThread = materials.some((m) => m.threadType === '平车线');
      const hasSilkThread = materials.some((m) => m.threadType === '丝光线');
      if (hasPlainThread && hasSilkThread) {
        if (process === '平车') return '平车线';
        return '丝光线';
      }
      return materials[0]?.threadType || null;
    };

    const summary = {
      平车线: { totalQty: 0, totalAmount: 0 },
      丝光线: { totalQty: 0, totalAmount: 0 },
    };

    order.calculations.forEach((calc) => {
      const threadType = getThreadTypeByProcess(calc.process);
      if (!threadType || (threadType !== '平车线' && threadType !== '丝光线')) return;

      const purchaseQty = Math.ceil(calc.requiredQty);
      const purchaseAmount = purchaseQty * calc.unitPrice;

      summary[threadType].totalQty += purchaseQty;
      summary[threadType].totalAmount += purchaseAmount;
    });

    return { ...summary, hasData: true };
  };

  // 获取所有服装种类（用于筛选）
  const garmentTypes = Array.from(new Set(orders.map((o) => o.garmentType)));

  // 按服装种类分组订单
  const ordersByGarmentType = orders.reduce((acc, order) => {
    if (!acc[order.garmentType]) {
      acc[order.garmentType] = [];
    }
    acc[order.garmentType].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // 切换折叠状态
  const toggleGarmentType = (garmentType: string) => {
    setExpandedGarmentTypes((prev) => ({
      ...prev,
      [garmentType]: !prev[garmentType],
    }));
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>订单管理</h1>

      {/* 搜索和筛选 */}
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            type="text"
            placeholder="搜索关键字（服装种类、属性）"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={selectedGarmentType}
            onChange={(e) => setSelectedGarmentType(e.target.value)}
          >
            <option value="">全部服装种类</option>
            {garmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleExportList}>
            导出订单列表
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="card">
        <h2 className="card-title">订单列表</h2>
        {isLoading ? (
          <p>加载中...</p>
        ) : orders.length === 0 ? (
          <p>暂无订单</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(ordersByGarmentType).map(([garmentType, typeOrders]) => {
              const isExpanded = expandedGarmentTypes[garmentType] ?? false;
              return (
                <div key={garmentType} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
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
                    onClick={() => toggleGarmentType(garmentType)}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
                      {garmentType} ({typeOrders.length})
                    </h3>
                    <span style={{ fontSize: '18px', color: '#666' }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
                      {typeOrders.map((order) => {
                        const summaryResult = getPurchaseSummaryByThreadType(order);
                        const summary = summaryResult as any;
                        const hasData = summary.hasData !== false;
                        return (
                          <div
                            key={order.id}
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              padding: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              background: 'white',
                            }}
                            onClick={() => handleView(order.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#007bff';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,123,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e0e0e0';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
                                  订单 #{order.id} - {order.attribute}
                                </h4>
                                <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                                  <span style={{ marginRight: '16px' }}>备注：{order.remark}</span>
                                  <span>创建时间：{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '14px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    orderApi.exportExcel(order.id);
                                  }}
                                >
                                  导出详细订单
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '14px' }}
                                  onClick={(e) => handleEdit(order.id, e)}
                                >
                                  编辑
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '6px 12px', fontSize: '14px' }}
                                  onClick={(e) => handleDelete(order.id, e)}
                                  disabled={deleteMutation.isPending}
                                >
                                  删除
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '12px' }}>
                              {/* 单件线费 */}
                              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>单件线费</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                                  {order.singleCost !== null ? `¥${order.singleCost.toFixed(2)}` : '-'}
                                </div>
                              </div>

                              {/* 平车线统计 */}
                              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>平车线采购</div>
                                {hasData ? (
                                  <>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                      <strong>数量：</strong>
                                      {summary.平车线.totalQty} 轴
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                      <strong>金额：</strong>
                                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                        ¥{summary.平车线.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ fontSize: '14px', color: '#999' }}>未计算</div>
                                )}
                              </div>

                              {/* 丝光线统计 */}
                              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>丝光线采购</div>
                                {hasData ? (
                                  <>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                      <strong>数量：</strong>
                                      {summary.丝光线.totalQty} 轴
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                      <strong>金额：</strong>
                                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                        ¥{summary.丝光线.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ fontSize: '14px', color: '#999' }}>未计算</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

