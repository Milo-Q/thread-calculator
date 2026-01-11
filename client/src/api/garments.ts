import apiClient from './client';

export interface GarmentType {
  id: number;
  typeName: string;
  attribute: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export const garmentApi = {
  getAll: () => apiClient.get<GarmentType[]>('/garments'),
  getAttributes: (typeName: string) =>
    apiClient.get<Array<{ attribute: string; remark: string }>>(`/garments/${typeName}/attributes`),
  create: (data: { typeName: string; attribute: string; remark: string }) =>
    apiClient.post<GarmentType>('/garments', data),
  update: (id: number, data: { typeName: string; attribute: string; remark: string }) =>
    apiClient.put<GarmentType>(`/garments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/garments/${id}`),
};

