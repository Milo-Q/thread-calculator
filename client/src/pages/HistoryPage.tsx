import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, Order } from '../api/orders';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState('');

  const { data: ordersData, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', searchKeyword, selectedGarmentType],
    queryFn: () =>
      orderApi.getAll({
        keyword: searchKeyword || undefined,
        garmentType: selectedGarmentType || undefined,
      }),
  });

  const orders: Order[] = ordersData || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('删除成功！');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (orderId: number) => {
    orderApi.exportExcel(orderId);
  };

  // 获取所有服装种类（用于筛选）
  const garmentTypes = Array.from(new Set(orders.map((o) => o.garmentType)));

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>历史订单</h1>

      {/* 搜索和筛选 */}
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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
            {garmentTypes.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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
          <table className="table">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>服装种类</th>
                <th>属性</th>
                <th>备注</th>
                <th>单件线费（元）</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.garmentType}</td>
                  <td>{order.attribute}</td>
                  <td>{order.remark}</td>
                  <td>{order.singleCost !== null ? `¥${order.singleCost.toFixed(2)}` : '-'}</td>
                  <td>{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '8px' }}
                      onClick={() => handleExport(order.id)}
                    >
                      导出Excel
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(order.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

