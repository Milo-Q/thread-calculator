import apiClient from './client';

export interface Color {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const colorApi = {
  getAll: () => apiClient.get<Color[]>('/colors'),
  create: (name: string) => apiClient.post<Color>('/colors', { name }),
  update: (id: number, name: string) => apiClient.put<Color>(`/colors/${id}`, { name }),
  delete: (id: number) => apiClient.delete(`/colors/${id}`),
};

