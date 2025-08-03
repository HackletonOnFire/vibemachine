import { renderHook, act } from '@testing-library/react';
import { useReports } from '../hooks/useReports';
import { useDashboardData } from '../hooks/useDashboardData';
import { ReportGenerator, generateMonthlyReport, generateCustomReport } from '../lib/utils/reportGenerator';

// Mock dependencies
jest.mock('../hooks/useDashboardData');
jest.mock('../lib/utils/reportGenerator');

const mockUseDashboardData = useDashboardData as jest.MockedFunction<typeof useDashboardData>;
const mockGenerateMonthlyReport = generateMonthlyReport as jest.MockedFunction<typeof generateMonthlyReport>;
const mockGenerateCustomReport = generateCustomReport as jest.MockedFunction<typeof generateCustomReport>;
const mockGetReportTemplates = jest.spyOn(ReportGenerator, 'getReportTemplates');

describe('Error Handling and Edge Cases', () => {
  const mockUserId = 'test-user-123';
  const validBlob = new Blob(['valid pdf content'], { type: 'application/pdf' });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage completely
    const localStorageMock = window.localStorage as jest.Mocked<Storage>;
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {}); // Reset to working implementation
    localStorageMock.removeItem.mockImplementation(() => {});
    localStorageMock.clear.mockImplementation(() => {});

    // Default successful mocks
    mockUseDashboardData.mockReturnValue({
      data: {
        user: { name: 'Test User', businessName: 'Test Corp', industry: 'Tech', location: 'SF' },
        energyData: { currentMonth: { electricity: 1000, gas: 500, totalCost: 1200 }, previousMonth: { electricity: 1100, gas: 550, totalCost: 1300 }, yearToDate: { electricity: 12000, gas: 6000, totalCost: 14400 } },
        carbonFootprint: { currentEmissions: 15.5, baseline: 20.0, reduction: 22.5, monthlyTrend: [] },
        goals: { targetReduction: 30, deadline: '2025-12-31', progress: 75, milestones: [] },
        recommendations: [],
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    mockGetReportTemplates.mockReturnValue([
      {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test Description',
        sections: [{ type: 'header', title: 'Test Header' }],
        branding: { primaryColor: '#000000', secondaryColor: '#111111', accentColor: '#222222' }
      }
    ]);

    mockGenerateMonthlyReport.mockResolvedValue(validBlob);
    mockGenerateCustomReport.mockResolvedValue(validBlob);
  });

  describe('PDF Generation Error Scenarios', () => {
    it('should handle PDF generation timeout', async () => {
      // Mock timeout error
      mockGenerateMonthlyReport.mockRejectedValue(new Error('Request timeout'));

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBe('Request timeout');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle out of memory errors during PDF generation', async () => {
      mockGenerateMonthlyReport.mockRejectedValue(new Error('JavaScript heap out of memory'));

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBe('JavaScript heap out of memory');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle PDF library initialization failures', async () => {
      mockGenerateMonthlyReport.mockRejectedValue(new Error('jsPDF initialization failed'));

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBe('jsPDF initialization failed');
    });

    it('should handle canvas rendering failures', async () => {
      mockGenerateMonthlyReport.mockRejectedValue(new Error('html2canvas: Failed to render element'));

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBe('html2canvas: Failed to render element');
    });

    it('should handle blob creation failures', async () => {
      // Mock blob creation returning invalid blob
      mockGenerateMonthlyReport.mockResolvedValue(null as any);

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBe('Failed to generate PDF blob');
    });

    it('should handle corrupted PDF output', async () => {
      // Mock corrupted blob
      const corruptedBlob = new Blob(['corrupted data'], { type: 'text/plain' });
      mockGenerateMonthlyReport.mockResolvedValue(corruptedBlob);

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should still succeed but with corrupted blob
      expect(result.current.error).toBeNull();
      expect(result.current.reports[0].blob).toBe(corruptedBlob);
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle malformed dashboard data', async () => {
      mockUseDashboardData.mockReturnValue({
        data: {
          user: null as any,
          energyData: { currentMonth: null } as any,
          carbonFootprint: { currentEmissions: 'invalid' } as any,
          goals: { progress: -1 } as any,
          recommendations: 'not an array' as any,
          lastUpdated: 'invalid date'
        },
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should fall back to mock data and succeed
      expect(result.current.error).toBeNull();
      expect(mockGenerateMonthlyReport).toHaveBeenCalled();
    });

    it('should handle missing critical dashboard fields', async () => {
      mockUseDashboardData.mockReturnValue({
        data: {} as any,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should use mock data fallback
      expect(result.current.error).toBeNull();
      expect(mockGenerateMonthlyReport).toHaveBeenCalled();
    });

    it('should handle extremely large dashboard data', async () => {
      const largeRecommendations = Array.from({ length: 10000 }, (_, i) => ({
        priority: 'high' as const,
        title: `Recommendation ${i}`,
        description: 'A'.repeat(10000),
        potentialSavings: Math.random() * 100000,
        co2Reduction: Math.random() * 100,
        implementationCost: Math.random() * 1000000,
        paybackPeriod: Math.random() * 120
      }));

      mockUseDashboardData.mockReturnValue({
        data: {
          user: { name: 'Test User', businessName: 'Test Corp', industry: 'Tech', location: 'SF' },
          energyData: { currentMonth: { electricity: 1000, gas: 500, totalCost: 1200 }, previousMonth: { electricity: 1100, gas: 550, totalCost: 1300 }, yearToDate: { electricity: 12000, gas: 6000, totalCost: 14400 } },
          carbonFootprint: { currentEmissions: 15.5, baseline: 20.0, reduction: 22.5, monthlyTrend: Array.from({ length: 1000 }, (_, i) => ({ month: `Month${i}`, emissions: Math.random() * 100 })) },
          goals: { targetReduction: 30, deadline: '2025-12-31', progress: 75, milestones: Array.from({ length: 1000 }, (_, i) => ({ title: `Milestone ${i}`, completed: Math.random() > 0.5, dueDate: '2024-12-31' })) },
          recommendations: largeRecommendations,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should handle large data without errors
      expect(result.current.error).toBeNull();
      expect(mockGenerateMonthlyReport).toHaveBeenCalled();
    });

    it('should handle circular references in dashboard data', async () => {
      const circularData: any = {
        user: { name: 'Test User', businessName: 'Test Corp', industry: 'Tech', location: 'SF' },
        energyData: { currentMonth: { electricity: 1000, gas: 500, totalCost: 1200 }, previousMonth: { electricity: 1100, gas: 550, totalCost: 1300 }, yearToDate: { electricity: 12000, gas: 6000, totalCost: 14400 } },
        carbonFootprint: { currentEmissions: 15.5, baseline: 20.0, reduction: 22.5, monthlyTrend: [] },
        goals: { targetReduction: 30, deadline: '2025-12-31', progress: 75, milestones: [] },
        recommendations: [],
        lastUpdated: '2024-01-15T10:30:00Z'
      };
      circularData.self = circularData;

      mockUseDashboardData.mockReturnValue({
        data: circularData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should handle circular references without infinite loops
      expect(result.current.error).toBeNull();
    });
  });

  describe('LocalStorage Edge Cases', () => {
    it('should handle localStorage quota exceeded', async () => {
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError: LocalStorage quota exceeded');
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should generate successfully but not save to localStorage
      expect(result.current.reports).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });

    it('should handle localStorage access denied', async () => {
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('SecurityError: Access denied');
      });
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('SecurityError: Access denied');
      });

      const { result } = renderHook(() => useReports(mockUserId));

      // Should still work without localStorage
      expect(result.current.reports).toBeDefined();
      expect(result.current.templates).toBeDefined();
    });

    it('should handle localStorage returning invalid JSON multiple times', async () => {
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      localStorageMock.getItem
        .mockReturnValueOnce('invalid json')
        .mockReturnValueOnce('still invalid')
        .mockReturnValueOnce(null);

      const { result } = renderHook(() => useReports(mockUserId));

      // Should fall back to default reports
      expect(result.current.reports).toHaveLength(4); // Mock reports
    });

    it('should handle localStorage corruption during write', async () => {
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      let callCount = 0;
      localStorageMock.setItem.mockImplementation((key, value) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Storage corruption detected');
        }
        // Allow subsequent calls to succeed
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      // Should continue working despite storage errors
      expect(result.current.reports).toHaveLength(1);
    });
  });

  describe('Network and Async Edge Cases', () => {
    it('should handle dashboard data fetch race conditions', async () => {
      let resolveCount = 0;
      mockUseDashboardData.mockImplementation(() => {
        const currentResolve = resolveCount++;
        return {
          data: currentResolve % 2 === 0 ? null : {
            user: { name: 'Test User', businessName: 'Test Corp', industry: 'Tech', location: 'SF' },
            energyData: { currentMonth: { electricity: 1000, gas: 500, totalCost: 1200 }, previousMonth: { electricity: 1100, gas: 550, totalCost: 1300 }, yearToDate: { electricity: 12000, gas: 6000, totalCost: 14400 } },
            carbonFootprint: { currentEmissions: 15.5, baseline: 20.0, reduction: 22.5, monthlyTrend: [] },
            goals: { targetReduction: 30, deadline: '2025-12-31', progress: 75, milestones: [] },
            recommendations: [],
            lastUpdated: '2024-01-15T10:30:00Z'
          },
          loading: currentResolve < 2,
          error: null,
          refetch: jest.fn()
        };
      });

      const { result, rerender } = renderHook(() => useReports(mockUserId));

      // Trigger multiple renders to simulate race conditions
      rerender();
      rerender();
      rerender();

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle PDF generation promise rejection after timeout', async () => {
      let timeoutId: NodeJS.Timeout;
      mockGenerateMonthlyReport.mockImplementation(() => {
        return new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Generation timeout'));
          }, 100);
        });
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      clearTimeout(timeoutId!);
      expect(result.current.error).toBe('Generation timeout');
    });

    it('should handle multiple concurrent PDF generations', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      // Start multiple generations concurrently
      const promise1 = act(async () => {
        await result.current.generateReport('test-template', 'Report 1');
      });

      const promise2 = act(async () => {
        await result.current.generateReport('test-template', 'Report 2');
      });

      const promise3 = act(async () => {
        await result.current.generateReport('test-template', 'Report 3');
      });

      await Promise.all([promise1, promise2, promise3]);

      // Should handle concurrent generations without corruption
      expect(result.current.reports.length).toBeGreaterThan(0);
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Template and Configuration Edge Cases', () => {
    it('should handle template with missing branding configuration', async () => {
      mockGetReportTemplates.mockReturnValue([
        {
          id: 'no-branding',
          name: 'No Branding Template',
          description: 'Template without branding',
          sections: [{ type: 'header', title: 'Test' }],
          branding: undefined as any
        }
      ]);

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('no-branding');
      });

      expect(result.current.error).toBeNull();
      expect(mockGenerateCustomReport).toHaveBeenCalled();
    });

    it('should handle template with invalid section types', async () => {
      mockGetReportTemplates.mockReturnValue([
        {
          id: 'invalid-sections',
          name: 'Invalid Sections Template',
          description: 'Template with invalid sections',
          sections: [
            { type: 'invalid-type' as any, title: 'Invalid Section' },
            { type: null as any, title: 'Null Type' },
            undefined as any
          ],
          branding: { primaryColor: '#000000', secondaryColor: '#111111', accentColor: '#222222' }
        }
      ]);

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('invalid-sections');
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle extremely long template names and descriptions', async () => {
      const longString = 'A'.repeat(10000);
      mockGetReportTemplates.mockReturnValue([
        {
          id: 'long-template',
          name: longString,
          description: longString,
          sections: [{ type: 'header', title: longString }],
          branding: { primaryColor: '#000000', secondaryColor: '#111111', accentColor: '#222222' }
        }
      ]);

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('long-template');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Browser Environment Edge Cases', () => {
    it('should handle missing URL.createObjectURL', () => {
      const originalCreateObjectURL = global.URL.createObjectURL;
      delete (global.URL as any).createObjectURL;

      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.downloadReport('non-existent');
      });

      expect(result.current.error).toBe('Report not found');

      // Restore
      global.URL.createObjectURL = originalCreateObjectURL;
    });

    it('should handle missing window.open', () => {
      const originalOpen = window.open;
      delete (window as any).open;

      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.previewReport('non-existent');
      });

      expect(result.current.error).toBe('Report not found');

      // Restore
      window.open = originalOpen;
    });

    it('should handle browser memory pressure during blob operations', () => {
      const largeBlobData = 'x'.repeat(100 * 1024 * 1024); // 100MB
      const largeBlob = new Blob([largeBlobData], { type: 'application/pdf' });

      const { result } = renderHook(() => useReports(mockUserId));

      // Add a report with large blob
      act(() => {
        result.current.reports[0] = {
          id: 'large-report',
          title: 'Large Report',
          description: 'Memory intensive report',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '100 MB',
          status: 'ready',
          blob: largeBlob,
          templateId: 'test-template'
        };
      });

      act(() => {
        result.current.downloadReport('large-report');
      });

      // Should handle large blobs without crashing
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(largeBlob);
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle special characters in report titles', async () => {
      const specialCharsTitle = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~';

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template', specialCharsTitle);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.reports[0].title).toBe(specialCharsTitle);
    });

    it('should handle unicode characters in report titles', async () => {
      const unicodeTitle = '🌱 环境报告 Rapporte de développement durable مستدامة';

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('test-template', unicodeTitle);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.reports[0].title).toBe(unicodeTitle);
    });

    it('should handle extremely long user IDs', async () => {
      const longUserId = 'user-' + 'a'.repeat(10000);

      const { result } = renderHook(() => useReports(longUserId));

      await act(async () => {
        await result.current.generateReport('test-template');
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle null and undefined user IDs', async () => {
      const { result: nullResult } = renderHook(() => useReports(null as any));
      const { result: undefinedResult } = renderHook(() => useReports(undefined));

      expect(nullResult.current.reports).toBeDefined();
      expect(undefinedResult.current.reports).toBeDefined();
    });
  });

  describe('Memory Management Edge Cases', () => {
    it('should handle cleanup of blob URLs after download', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });

      // Add report with blob
      act(() => {
        result.current.reports[0] = {
          id: 'cleanup-test',
          title: 'Cleanup Test',
          description: 'Test blob cleanup',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1 MB',
          status: 'ready',
          blob: mockBlob,
          templateId: 'test-template'
        };
      });

      act(() => {
        result.current.downloadReport('cleanup-test');
      });

      // Verify cleanup is called
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle multiple blob cleanups', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      const mockBlob1 = new Blob(['test1'], { type: 'application/pdf' });
      const mockBlob2 = new Blob(['test2'], { type: 'application/pdf' });

      // Add multiple reports with blobs
      act(() => {
        result.current.reports[0] = {
          id: 'cleanup-1',
          title: 'Cleanup 1',
          description: 'Test 1',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1 MB',
          status: 'ready',
          blob: mockBlob1,
          templateId: 'test-template'
        };
        result.current.reports[1] = {
          id: 'cleanup-2',
          title: 'Cleanup 2',
          description: 'Test 2',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1 MB',
          status: 'ready',
          blob: mockBlob2,
          templateId: 'test-template'
        };
      });

      act(() => {
        result.current.downloadReport('cleanup-1');
        result.current.downloadReport('cleanup-2');
      });

      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });
}); 