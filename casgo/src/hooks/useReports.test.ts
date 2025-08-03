import { renderHook, act, waitFor } from '@testing-library/react';
import { useReports } from './useReports';
import { useDashboardData } from './useDashboardData';
import { generateMonthlyReport, generateCustomReport, ReportGenerator } from '../lib/utils/reportGenerator';

// Mock dependencies
jest.mock('./useDashboardData');
jest.mock('../lib/utils/reportGenerator');

const mockUseDashboardData = useDashboardData as jest.MockedFunction<typeof useDashboardData>;
const mockGenerateMonthlyReport = generateMonthlyReport as jest.MockedFunction<typeof generateMonthlyReport>;
const mockGenerateCustomReport = generateCustomReport as jest.MockedFunction<typeof generateCustomReport>;
const mockGetReportTemplates = jest.spyOn(ReportGenerator, 'getReportTemplates');

describe('useReports', () => {
  const mockUserId = 'test-user-123';
  const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
  
  const mockDashboardData = {
    user: {
      name: 'Test User',
      businessName: 'Test Corp',
      industry: 'Technology',
      location: 'San Francisco, CA'
    },
    energyData: {
      currentMonth: { electricity: 1000, gas: 500, totalCost: 1200 },
      previousMonth: { electricity: 1100, gas: 550, totalCost: 1300 },
      yearToDate: { electricity: 12000, gas: 6000, totalCost: 14400 }
    },
    carbonFootprint: {
      currentEmissions: 15.5,
      baseline: 20.0,
      reduction: 22.5,
      monthlyTrend: [
        { month: 'Jan', emissions: 20.0 },
        { month: 'Feb', emissions: 18.5 },
        { month: 'Mar', emissions: 15.5 }
      ]
    },
    goals: {
      targetReduction: 30,
      deadline: '2025-12-31',
      progress: 75,
      milestones: [
        { title: 'LED Upgrade', completed: true, dueDate: '2024-03-31' },
        { title: 'HVAC Optimization', completed: false, dueDate: '2024-06-30' }
      ]
    },
    recommendations: [
      {
        priority: 'high' as const,
        title: 'Smart Thermostat Installation',
        description: 'Install programmable thermostats',
        potentialSavings: 2000,
        co2Reduction: 2.5,
        implementationCost: 1000,
        paybackPeriod: 6
      }
    ],
    lastUpdated: '2024-01-15T10:30:00Z'
  };

  const mockTemplates = [
    {
      id: 'monthly-sustainability',
      name: 'Monthly Sustainability Report',
      description: 'Comprehensive monthly overview',
      sections: [
        { type: 'header' as const, title: 'Monthly Report' },
        { type: 'summary' as const, title: 'Summary' }
      ],
      branding: {
        primaryColor: '#10B981',
        secondaryColor: '#1F2937',
        accentColor: '#3B82F6'
      }
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for leadership',
      sections: [
        { type: 'header' as const, title: 'Executive Summary' },
        { type: 'recommendations' as const, title: 'Key Actions' }
      ],
      branding: {
        primaryColor: '#10B981',
        secondaryColor: '#1F2937',
        accentColor: '#3B82F6'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock
    const localStorageMock = window.localStorage as jest.Mocked<Storage>;
    localStorageMock.getItem.mockReturnValue(null);
    
    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    mockGetReportTemplates.mockReturnValue(mockTemplates);
    mockGenerateMonthlyReport.mockResolvedValue(mockBlob);
    mockGenerateCustomReport.mockResolvedValue(mockBlob);
  });

  describe('Initialization', () => {
    it('should initialize with empty reports when no saved reports exist', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.reports).toHaveLength(4); // Mock reports
      expect(result.current.templates).toEqual(mockTemplates);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load saved reports from localStorage', () => {
      const savedReports = [
        {
          id: '1',
          title: 'Saved Report',
          description: 'A saved report',
          lastGenerated: '2024-01-15',
          type: 'PDF' as const,
          size: '1.5 MB',
          status: 'ready' as const,
          templateId: 'monthly-sustainability'
        }
      ];

      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedReports));

      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.reports).toEqual(savedReports);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.reports).toHaveLength(4); // Falls back to mock reports
    });

    it('should handle dashboard error state', () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Dashboard error',
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.error).toBe('Dashboard error');
    });
  });

  describe('Report Generation', () => {
    it('should generate monthly report successfully', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(mockGenerateMonthlyReport).toHaveBeenCalledWith(mockDashboardData);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.reports[0]).toMatchObject({
        title: 'Monthly Sustainability Report',
        status: 'ready',
        templateId: 'monthly-sustainability'
      });
    });

    it('should generate custom report with template', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('executive-summary');
      });

      expect(mockGenerateCustomReport).toHaveBeenCalledWith(
        mockDashboardData,
        mockTemplates[1],
        undefined
      );
      expect(result.current.reports[0]).toMatchObject({
        title: 'Executive Summary',
        status: 'ready',
        templateId: 'executive-summary'
      });
    });

    it('should generate report with custom title', async () => {
      const { result } = renderHook(() => useReports(mockUserId));
      const customTitle = 'My Custom Report';

      await act(async () => {
        await result.current.generateReport('executive-summary', customTitle);
      });

      expect(mockGenerateCustomReport).toHaveBeenCalledWith(
        mockDashboardData,
        mockTemplates[1],
        customTitle
      );
      expect(result.current.reports[0]).toMatchObject({
        title: customTitle,
        status: 'ready',
        templateId: 'executive-summary'
      });
    });

    it('should handle template not found error', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('non-existent-template');
      });

      expect(result.current.error).toBe('Template not found');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should use mock data when dashboard data is not available', async () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(mockGenerateMonthlyReport).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('should add mock recommendations when dashboard data has no recommendations', async () => {
      const dataWithoutRecommendations = {
        ...mockDashboardData,
        recommendations: []
      };

      mockUseDashboardData.mockReturnValue({
        data: dataWithoutRecommendations,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(mockGenerateMonthlyReport).toHaveBeenCalledWith(
        expect.objectContaining({
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              description: expect.any(String)
            })
          ])
        })
      );
    });

    it('should handle PDF generation errors', async () => {
      mockGenerateMonthlyReport.mockRejectedValue(new Error('PDF generation failed'));

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(result.current.error).toBe('PDF generation failed');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should set isGenerating state correctly during generation', async () => {
      let resolveGeneration: (value: Blob) => void;
      const generationPromise = new Promise<Blob>((resolve) => {
        resolveGeneration = resolve;
      });
      mockGenerateMonthlyReport.mockReturnValue(generationPromise);

      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.generateReport('monthly-sustainability');
      });

      expect(result.current.isGenerating).toBe(true);

      await act(async () => {
        resolveGeneration(mockBlob);
        await generationPromise;
      });

      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Report Download', () => {
    it('should download report with blob data', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a report with blob data
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready',
          blob: mockBlob,
          templateId: 'monthly-sustainability'
        };
      });

      act(() => {
        result.current.downloadReport('1');
      });

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('should regenerate report when blob is not available', async () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a report without blob data
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready',
          templateId: 'monthly-sustainability'
        };
      });

      await act(async () => {
        result.current.downloadReport('1');
      });

      expect(mockGenerateMonthlyReport).toHaveBeenCalled();
    });

    it('should handle download of non-existent report', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.downloadReport('non-existent-id');
      });

      expect(result.current.error).toBe('Report not found');
    });

    it('should handle download of non-ready report', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a generating report
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: 'In Progress',
          type: 'PDF',
          size: '-',
          status: 'generating',
          templateId: 'monthly-sustainability'
        };
      });

      act(() => {
        result.current.downloadReport('1');
      });

      expect(result.current.error).toBe('Report is not ready for download');
    });

    it('should handle report without templateId', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a report without templateId
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready'
        };
      });

      act(() => {
        result.current.downloadReport('1');
      });

      expect(result.current.error).toBe('Unable to download report. Please regenerate it.');
    });
  });

  describe('Report Preview', () => {
    it('should preview report with blob data', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a report with blob data
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready',
          blob: mockBlob,
          templateId: 'monthly-sustainability'
        };
      });

      act(() => {
        result.current.previewReport('1');
      });

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(window.open).toHaveBeenCalledWith('mocked-url', '_blank');
    });

    it('should handle preview of non-existent report', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.previewReport('non-existent-id');
      });

      expect(result.current.error).toBe('Report not found');
    });

    it('should handle preview of non-ready report', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a generating report
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: 'In Progress',
          type: 'PDF',
          size: '-',
          status: 'generating',
          templateId: 'monthly-sustainability'
        };
      });

      act(() => {
        result.current.previewReport('1');
      });

      expect(result.current.error).toBe('Report is not ready for preview');
    });

    it('should handle preview without blob data', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      // Add a report without blob data
      act(() => {
        result.current.reports[0] = {
          id: '1',
          title: 'Test Report',
          description: 'Test',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready',
          templateId: 'monthly-sustainability'
        };
      });

      act(() => {
        result.current.previewReport('1');
      });

      expect(result.current.error).toBe('Report preview not available. Please regenerate the report.');
    });
  });

  describe('Report Deletion', () => {
    it('should delete report successfully', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      const initialReportsCount = result.current.reports.length;

      act(() => {
        result.current.deleteReport(result.current.reports[0].id);
      });

      expect(result.current.reports).toHaveLength(initialReportsCount - 1);
    });

    it('should not affect other reports when deleting one', () => {
      const { result } = renderHook(() => useReports(mockUserId));
      
      const reportToKeep = result.current.reports[1];
      const reportToDeleteId = result.current.reports[0].id;

      act(() => {
        result.current.deleteReport(reportToDeleteId);
      });

      expect(result.current.reports).toContain(reportToKeep);
      expect(result.current.reports.find(r => r.id === reportToDeleteId)).toBeUndefined();
    });
  });

  describe('Report Scheduling', () => {
    it('should schedule report with monthly frequency', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.scheduleReport('monthly-sustainability', 'monthly');
      });

      expect(result.current.error).toBeNull();
    });

    it('should schedule report with weekly frequency', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.scheduleReport('executive-summary', 'weekly');
      });

      expect(result.current.error).toBeNull();
    });

    it('should schedule report with quarterly frequency', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      act(() => {
        result.current.scheduleReport('regulatory-compliance', 'quarterly');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Local Storage Persistence', () => {
    it('should save reports to localStorage when reports change', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `reports-${mockUserId}`,
        expect.stringContaining('Monthly Sustainability Report')
      );
    });

    it('should not save blob data to localStorage', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      
      expect(parsedData[0]).not.toHaveProperty('blob');
    });

    it('should not save to localStorage without userId', async () => {
      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Error State Management', () => {
    it('should clear error when generating new report', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      // Set an error state
      act(() => {
        result.current.downloadReport('non-existent-id');
      });
      expect(result.current.error).toBeTruthy();

      // Generate new report should clear error
      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle unknown error types in generation', async () => {
      mockGenerateMonthlyReport.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useReports(mockUserId));

      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      expect(result.current.error).toBe('Failed to generate report');
    });
  });

  describe('Template Management', () => {
    it('should return all templates from ReportGenerator', () => {
      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.templates).toEqual(mockTemplates);
      expect(mockGetReportTemplates).toHaveBeenCalled();
    });

    it('should maintain templates consistency across renders', () => {
      const { result, rerender } = renderHook(() => useReports(mockUserId));
      
      const initialTemplates = result.current.templates;
      
      rerender();
      
      expect(result.current.templates).toBe(initialTemplates);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle undefined userId gracefully', () => {
      const { result } = renderHook(() => useReports(undefined));

      expect(result.current.reports).toBeDefined();
      expect(result.current.templates).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it('should handle dashboard loading state', () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useReports(mockUserId));

      expect(result.current.error).toBeNull();
    });

    it('should maintain state consistency after multiple operations', async () => {
      const { result } = renderHook(() => useReports(mockUserId));

      // Generate report
      await act(async () => {
        await result.current.generateReport('monthly-sustainability');
      });

      const reportId = result.current.reports[0].id;

      // Download report
      act(() => {
        result.current.downloadReport(reportId);
      });

      // Preview report
      act(() => {
        result.current.previewReport(reportId);
      });

      // Delete report
      act(() => {
        result.current.deleteReport(reportId);
      });

      expect(result.current.reports.find(r => r.id === reportId)).toBeUndefined();
    });
  });
}); 