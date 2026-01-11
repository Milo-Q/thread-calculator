import apiClient from './client';

export interface StatisticsItem {
  garmentType: string;
  attribute: string;
  averageSingleCost: number;
  orderCount: number;
  averageMeasurements: Record<string, number>;
}

export const statisticsApi = {
  getAll: () => apiClient.get<StatisticsItem[]>('/statistics'),
};

