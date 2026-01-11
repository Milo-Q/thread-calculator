import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, Order, CreateOrderData } from '../api/orders';
import { garmentApi } from '../api/garments';
import { colorApi } from '../api/colors';
import ColorManager from '../components/ColorManager';

const PROCESSES = ['平车', '三线', '四线', '五线', '坎车', '三针五线'];
const THREAD_TYPES = ['平车线', '丝光线'];

export default function OrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orderData, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(parseInt(id!)),
    enabled: !!id,
  });

  const order: Order | undefined = orderData;

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

  // 加载订单数据到表单
  useEffect(() => {
    if (order) {
      setSelectedGarmentType(order.garmentType);
      setSelectedAttribute(order.attribute);
      setRemark(order.remark);
      setMaterials(
        order.materials.map((m) => ({
          threadType: m.threadType,
          spoolLength: m.spoolLength.toString(),
          unitPrice: m.unitPrice.toString(),
        }))
      );
      setOrderDetails(
        order.orderDetails.map((od) => ({
          colorId: od.colorId,
          quantity: od.quantity.toString(),
        }))
      );
      const measurementsMap: Record<string, string> = {};
      order.measurements.forEach((m) => {
        if (m.measureValue !== null) {
          measurementsMap[m.process] = m.measureValue.toString();
        }
      });
      setMeasurements(measurementsMap);
    }
  }, [order]);

  // 当选择属性时，自动填充备注
  useEffect(() => {
    if (selectedAttribute && attributes.length > 0) {
      const attr = attributes.find((a) => a.attribute === selectedAttribute);
      if (attr) {
        setRemark(attr.remark);
      }
    }
  }, [selectedAttribute, attributes]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateOrderData) => orderApi.update(parseInt(id!), data),
    onSuccess: async () => {
      // 重新计算
      await orderApi.calculate(parseInt(id!));
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${id}`);
      alert('更新成功！');
    },
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    // 创建订单数据
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

    updateMutation.mutate(orderData);
  };

  if (isLoading) {
    return <div className="container">加载中...</div>;
  }

  if (!order) {
    return <div className="container">订单不存在</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>编辑订单 #{id}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/orders/${id}`)}>
          取消
        </button>
      </div>

      <form onSubmit={handleSubmit}>
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
              {Array.from(new Set(garmentTypes.map((g) => g.typeName))).map((typeName) => (
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
                {attributes.map((attr: { attribute: string; remark: string }, index: number) => (
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
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveMaterial(index)}
                >
                  删除
                </button>
              )}
            </div>
          ))}
          {materials.length < THREAD_TYPES.length && (
            <button type="button" className="btn btn-secondary" onClick={handleAddMaterial}>
              添加线种类
            </button>
          )}
        </div>

        {/* 订单详情 */}
        <div className="card">
          <h2 className="card-title">订单详情</h2>
          {orderDetails.map((detail, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={detail.colorId}
                onChange={(e) => handleOrderDetailChange(index, 'colorId', parseInt(e.target.value))}
              >
                <option value="0">请选择颜色</option>
                {colors.map((color: Color) => (
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
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveOrderDetail(index)}
                >
                  删除
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={handleAddOrderDetail}>
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

        {/* 提交按钮 */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? '保存中...' : '保存并重新计算'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/orders/${id}`)}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

