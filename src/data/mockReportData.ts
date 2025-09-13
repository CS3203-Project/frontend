// Mock data for admin reports
import type { ReportData } from '../api/adminApi';

export const mockReports: ReportData[] = [
  {
    id: '1',
    name: 'User Analytics Report - November 2025.pdf',
    type: 'analytics',
    generatedAt: '2025-09-13T10:30:00Z',
    downloadUrl: '/reports/analytics-nov-2025.pdf',
    status: 'completed',
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Provider Performance Report - October 2025.xlsx',
    type: 'providers',
    generatedAt: '2025-09-12T14:15:00Z',
    downloadUrl: '/reports/providers-oct-2025.xlsx',
    status: 'completed',
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'Service Categories Report - September 2025.csv',
    type: 'services',
    generatedAt: '2025-09-11T09:45:00Z',
    downloadUrl: '/reports/services-sep-2025.csv',
    status: 'completed',
    fileSize: '856 KB'
  },
  {
    id: '4',
    name: 'Transaction Summary Report - August 2025.pdf',
    type: 'transactions',
    generatedAt: '2025-09-10T16:20:00Z',
    downloadUrl: '/reports/transactions-aug-2025.pdf',
    status: 'generating',
    fileSize: undefined
  },
  {
    id: '5',
    name: 'User Growth Report - July 2025.xlsx',
    type: 'users',
    generatedAt: '2025-09-09T11:30:00Z',
    downloadUrl: '/reports/users-jul-2025.xlsx',
    status: 'failed',
    fileSize: undefined
  }
];

// Utility function to simulate API delays
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API response wrapper
export const createMockApiResponse = <T>(data: T) => ({
  success: true,
  message: 'Request successful',
  data
});
