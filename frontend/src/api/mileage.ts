import apiClient from './index';

export interface MileageLog {
  id: string;
  date: string;
  distance: number;
  description?: string;
  reimbursement: number;
}

export type MileageInput = Omit<MileageLog, 'id' | 'reimbursement'>;

export async function listMileageLogs(): Promise<MileageLog[]> {
  const response = await apiClient.get<MileageLog[]>('/mileage');
  return response.data;
}

export async function createMileageLog(log: MileageInput): Promise<MileageLog> {
  const response = await apiClient.post<MileageLog>('/mileage', log);
  return response.data;
}

export async function updateMileageLog(
  id: string,
  log: Partial<MileageInput>
): Promise<MileageLog> {
  const response = await apiClient.put<MileageLog>(`/mileage/${id}`, log);
  return response.data;
}

export async function deleteMileageLog(id: string): Promise<void> {
  await apiClient.delete(`/mileage/${id}`);
}

