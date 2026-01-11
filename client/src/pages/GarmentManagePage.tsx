import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garmentApi, GarmentType } from '../api/garments';

export default function GarmentManagePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedGarmentTypes, setExpandedGarmentTypes] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    typeName: '',
    attribute: '',
    remark: '',
  });

  const { data: garmentsData, isLoading } = useQuery<GarmentType[]>({
    queryKey: ['garmentTypes'],
    queryFn: () => garmentApi.getAll(),
  });

  const garments: GarmentType[] = garmentsData || [];

  const createMutation = useMutation({
    mutationFn: (data: { typeName: string; attribute: string; remark: string }) =>
      garmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garmentTypes'] });
      resetForm();
      alert('添加成功！');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { typeName: string; attribute: string; remark: string } }) =>
      garmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garmentTypes'] });
      resetForm();
      alert('更新成功！');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => garmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garmentTypes'] });
      alert('删除成功！');
    },
  });

  const resetForm = () => {
    setFormData({ typeName: '', attribute: '', remark: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (garment: GarmentType) => {
    setFormData({
      typeName: garment.typeName,
      attribute: garment.attribute,
      remark: garment.remark,
    });
    setIsEditing(true);
    setEditingId(garment.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeName || !formData.attribute || !formData.remark) {
      alert('请填写完整信息');
      return;
    }
    if (isEditing && editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteMutation.mutate(id);
    }
  };

  // 按服装种类分组
  const groupedGarments: Record<string, GarmentType[]> = {};
  garments.forEach((garment) => {
    if (!groupedGarments[garment.typeName]) {
      groupedGarments[garment.typeName] = [];
    }
    groupedGarments[garment.typeName].push(garment);
  });

  // 切换折叠状态
  const toggleGarmentType = (typeName: string) => {
    setExpandedGarmentTypes((prev) => ({
      ...prev,
      [typeName]: !prev[typeName],
    }));
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>服装种类管理</h1>

      {/* 添加/编辑表单 */}
      <div className="card">
        <h2 className="card-title">{isEditing ? '编辑服装种类' : '添加服装种类'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">服装种类</label>
            <input
              className="form-input"
              type="text"
              placeholder="如：冲锋衣"
              value={formData.typeName}
              onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">属性</label>
            <input
              className="form-input"
              type="text"
              placeholder="如：挂里、简单、复杂等"
              value={formData.attribute}
              onChange={(e) => setFormData({ ...formData, attribute: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">备注</label>
            <input
              className="form-input"
              type="text"
              placeholder="如：正常拼接挂里"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary">
              {isEditing ? '更新' : '添加'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 服装种类列表 */}
      <div className="card">
        <h2 className="card-title">服装种类列表</h2>
        {isLoading ? (
          <p>加载中...</p>
        ) : garments.length === 0 ? (
          <p>暂无数据</p>
        ) : (
          <div>
            {Object.entries(groupedGarments).map(([typeName, items]) => {
              const isExpanded = expandedGarmentTypes[typeName] ?? false;
              return (
                <div key={typeName} style={{ marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
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
                    onClick={() => toggleGarmentType(typeName)}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#007bff' }}>
                      {typeName}
                    </h3>
                    <span style={{ fontSize: '18px', color: '#666' }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  {isExpanded && (
                    <div style={{ overflow: 'auto' }}>
                      <table className="table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>属性</th>
                            <th>备注</th>
                            <th style={{ textAlign: 'right' }}>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((garment) => (
                            <tr key={garment.id}>
                              <td>{garment.attribute}</td>
                              <td>{garment.remark}</td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ marginRight: '8px' }}
                                  onClick={() => handleEdit(garment)}
                                >
                                  编辑
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleDelete(garment.id)}
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

