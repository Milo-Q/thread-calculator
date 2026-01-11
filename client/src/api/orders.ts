import apiClient from './client';

export interface Order {
  id: number;
  garmentType: string;
  attribute: string;
  remark: string;
  singleCost: number | null;
  createdAt: string;
  updatedAt: string;
  materials: Material[];
  orderDetails: OrderDetail[];
  measurements: Measurement[];
  calculations?: Calculation[];
}

export interface Material {
  id: number;
  orderId: number;
  threadType: string;
  spoolLength: number;
  unitPrice: number;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  colorId: number;
  quantity: number;
  color?: { id: number; name: string };
}

export interface Measurement {
  id: number;
  orderId: number;
  process: string;
  measureValue: number | null;
}

export interface Calculation {
  id: number;
  orderId: number;
  process: string;
  colorId: number;
  quantity: number;
  measureValue: number | null;
  unitUsage: number | null;
  spoolLength: number;
  requiredQty: number;
  unitPrice: number;
  purchaseAmount: number;
  threadCost: number;
}

export interface CreateOrderData {
  garmentType: string;
  attribute: string;
  remark?: string;
  materials: Array<{ threadType: string; spoolLength: number; unitPrice: number }>;
  orderDetails: Array<{ colorId: number; quantity: number }>;
  measurements: Array<{ process: string; measureValue: number | null }>;
}

export const orderApi = {
  getAll: (params?: {
    garmentType?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) => apiClient.get<Order[]>('/orders', { params }),
  getById: (id: number) => apiClient.get<Order>(`/orders/${id}`),
  create: (data: CreateOrderData) => apiClient.post<Order>('/orders', data),
  update: (id: number, data: CreateOrderData) => apiClient.put<Order>(`/orders/${id}`, data),
  delete: (id: number) => apiClient.delete(`/orders/${id}`),
  calculate: (id: number) => apiClient.post(`/calculations/order/${id}`, {}),
  exportExcel: (id: number) => {
    window.open(`${apiClient.defaults.baseURL}/export/order/${id}/excel`, '_blank');
  },
  exportOrdersList: (params?: {
    garmentType?: string;
    keyword?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.garmentType) queryParams.append('garmentType', params.garmentType);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    const queryString = queryParams.toString();
    window.open(`${apiClient.defaults.baseURL}/export/orders/excel${queryString ? `?${queryString}` : ''}`, '_blank');
  },
};

