import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorApi, Color } from '../api/colors';

interface ColorManagerProps {
  onColorSelect?: (colorId: number) => void;
  selectedColorId?: number;
}

export default function ColorManager({ onColorSelect, selectedColorId }: ColorManagerProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [colorName, setColorName] = useState('');

  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: () => colorApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => colorApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      setColorName('');
      setIsAdding(false);
      alert('添加成功！');
    },
    onError: (error: any) => {
      alert(error.message || '添加失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => colorApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      setColorName('');
      setEditingId(null);
      alert('更新成功！');
    },
    onError: (error: any) => {
      alert(error.message || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => colorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      alert('删除成功！');
    },
    onError: (error: any) => {
      alert(error.message || '删除失败');
    },
  });

  const handleAdd = () => {
    if (!colorName.trim()) {
      alert('请输入颜色名称');
      return;
    }
    createMutation.mutate(colorName.trim());
  };

  const handleEdit = (color: Color) => {
    setColorName(color.name);
    setEditingId(color.id);
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId || !colorName.trim()) {
      alert('请输入颜色名称');
      return;
    }
    updateMutation.mutate({ id: editingId, name: colorName.trim() });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除这个颜色吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setColorName('');
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="card-title" style={{ margin: 0 }}>颜色管理</h2>
        {!isAdding && !editingId && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            添加颜色
          </button>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {(isAdding || editingId) && (
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '4px', marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">颜色名称</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                className="form-input"
                type="text"
                placeholder="请输入颜色名称"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? '更新' : '添加'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 颜色列表 */}
      {colors.length === 0 ? (
        <p>暂无颜色，请添加</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {colors.map((color) => (
            <div
              key={color.id}
              style={{
                padding: '8px 16px',
                border: selectedColorId === color.id ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '4px',
                background: selectedColorId === color.id ? '#e7f3ff' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: onColorSelect ? 'pointer' : 'default',
              }}
              onClick={() => onColorSelect && onColorSelect(color.id)}
            >
              <span>{color.name}</span>
              {!onColorSelect && (
                <>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(color);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(color.id);
                    }}
                  >
                    删除
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

