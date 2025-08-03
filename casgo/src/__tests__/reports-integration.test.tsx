import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReportsPage from '../app/dashboard/reports/page';
import { useAuth } from '../lib/auth';
import { useDashboardData } from '../hooks/useDashboardData';
import { useReports } from '../hooks/useReports';

// Mock all dependencies
jest.mock('../lib/auth');
jest.mock('../hooks/useDashboardData');
jest.mock('../hooks/useReports');
jest.mock('../lib/utils/reportGenerator');

// Mock Layout component
jest.mock('../../components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  )
}));

// Mock UI components
jest.mock('../components/ui', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  Spinner: ({ size }: any) => (
    <div data-testid="spinner" data-size={size}>
      Loading...
    </div>
  )
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDashboardData = useDashboardData as jest.MockedFunction<typeof useDashboardData>;
const mockUseReports = useReports as jest.MockedFunction<typeof useReports>;

describe('Reports Integration Tests', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User'
    }
  };

  const mockDashboardData = {
    user: {
      name: 'Test User',
      businessName: 'EcoTest Corp',
      industry: 'Technology',
      location: 'San Francisco, CA'
    },
    energyData: {
      currentMonth: { electricity: 1500, gas: 800, totalCost: 1800 },
      previousMonth: { electricity: 1600, gas: 850, totalCost: 1900 },
      yearToDate: { electricity: 18000, gas: 9600, totalCost: 21600 }
    },
    carbonFootprint: {
      currentEmissions: 18.5,
      baseline: 25.0,
      reduction: 26.0,
      monthlyTrend: [
        { month: 'Jan', emissions: 25.0 },
        { month: 'Feb', emissions: 22.0 },
        { month: 'Mar', emissions: 18.5 }
      ]
    },
    goals: {
      targetReduction: 35,
      deadline: '2025-12-31',
      progress: 74,
      milestones: [
        { title: 'Solar Panel Installation', completed: true, dueDate: '2024-06-30' },
        { title: 'Energy Management System', completed: false, dueDate: '2024-09-30' },
        { title: 'LED Lighting Upgrade', completed: true, dueDate: '2024-03-31' }
      ]
    },
    recommendations: [
      {
        priority: 'high' as const,
        title: 'Advanced HVAC Optimization',
        description: 'Implement smart HVAC controls with occupancy sensors',
        potentialSavings: 3500,
        co2Reduction: 4.2,
        implementationCost: 8000,
        paybackPeriod: 27
      },
      {
        priority: 'medium' as const,
        title: 'Window Insulation Upgrade',
        description: 'Replace single-pane windows with energy-efficient double-pane',
        potentialSavings: 2200,
        co2Reduction: 2.8,
        implementationCost: 12000,
        paybackPeriod: 55
      },
      {
        priority: 'low' as const,
        title: 'Motion Sensor Lighting',
        description: 'Install motion sensors in low-traffic areas',
        potentialSavings: 800,
        co2Reduction: 1.1,
        implementationCost: 1500,
        paybackPeriod: 23
      }
    ],
    lastUpdated: '2024-01-15T10:30:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    // Mock useReports with default template data
    mockUseReports.mockReturnValue({
      reports: [
        {
          id: 'default-report-1',
          title: 'Monthly Sustainability Report',
          description: 'Comprehensive monthly analysis',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '2.1 MB',
          status: 'ready',
          templateId: 'monthly-summary'
        }
      ],
      templates: [
        {
          id: 'monthly-summary',
          name: 'Monthly Sustainability Report',
          description: 'Comprehensive monthly analysis of energy usage, carbon footprint, and goal progress',
          sections: [
            { type: 'header', title: 'Executive Summary' },
            { type: 'chart', title: 'Energy Overview' },
            { type: 'summary', title: 'Carbon Footprint Analysis' },
            { type: 'table', title: 'Goal Progress' },
            { type: 'recommendations', title: 'Recommendations' }
          ]
        },
        {
          id: 'executive-summary',
          name: 'Executive Summary Report',
          description: 'High-level overview for stakeholders and management',
          sections: [
            { type: 'summary', title: 'Key Metrics' },
            { type: 'chart', title: 'Performance Summary' },
            { type: 'text', title: 'Strategic Insights' }
          ]
        },
        {
          id: 'compliance-report',
          name: 'ESG Compliance Report',
          description: 'Detailed report for regulatory and compliance requirements',
          sections: [
            { type: 'text', title: 'Regulatory Compliance' },
            { type: 'summary', title: 'Environmental Impact' },
            { type: 'table', title: 'Governance Metrics' },
            { type: 'text', title: 'Audit Trail' }
          ]
        }
      ],
      isGenerating: false,
      error: null,
      generateReport: jest.fn(),
      downloadReport: jest.fn(),
      previewReport: jest.fn(),
      deleteReport: jest.fn(),
      scheduleReport: jest.fn()
    });

    // Reset localStorage
    const localStorageMock = window.localStorage as jest.Mocked<Storage>;
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Complete Report Generation Workflow', () => {
    it('should complete full report generation workflow from start to finish', async () => {
      render(<ReportsPage />);

      // 1. Verify page loads with correct initial state
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
      expect(screen.getByText('Generate New Report')).toBeInTheDocument();

      // 2. Click "Generate New Report" button
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      // 3. Verify modal opens
      await waitFor(() => {
        expect(screen.getByText(/Choose a report template/i)).toBeInTheDocument();
      });

      // 4. Select a template (Monthly Sustainability Report)
      const templateCards = screen.getAllByTestId('card');
      const monthlyReportCard = templateCards.find(card => 
        card.textContent?.includes('Monthly Sustainability Report')
      );
      
      expect(monthlyReportCard).toBeInTheDocument();
      fireEvent.click(monthlyReportCard!);

      // 5. Verify customization step
      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      // 6. Enter custom title
      const titleInput = screen.getByLabelText('Custom Title (Optional)');
      fireEvent.change(titleInput, { target: { value: 'Q1 2024 Sustainability Report' } });

      // 7. Click "Generate Report"
      const finalGenerateButton = screen.getByText('Generate Report');
      fireEvent.click(finalGenerateButton);

      // 8. Verify modal closes and report appears in list
      await waitFor(() => {
        expect(screen.queryByText('Generate New Report')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // 9. Verify report appears in the reports list
      await waitFor(() => {
        expect(screen.getByText('Q1 2024 Sustainability Report')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
    });

    it('should handle template selection and back navigation workflow', async () => {
      render(<ReportsPage />);

      // Open modal
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Choose a report template/i)).toBeInTheDocument();
      });

      // Select Executive Summary template
      const templateCards = screen.getAllByTestId('card');
      const executiveCard = templateCards.find(card => 
        card.textContent?.includes('Executive Summary')
      );
      fireEvent.click(executiveCard!);

      // Verify customization step
      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
        expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      });

      // Go back to template selection
      const backButton = screen.getByText('Back to Templates');
      fireEvent.click(backButton);

      // Verify back at template selection
      await waitFor(() => {
        expect(screen.getByText(/Choose a report template/i)).toBeInTheDocument();
      });

      // Select different template (Technical Deep Dive)
      const technicalCard = templateCards.find(card => 
        card.textContent?.includes('Technical Deep Dive')
      );
      fireEvent.click(technicalCard!);

      // Verify new template selected
      await waitFor(() => {
        expect(screen.getByText('Technical Deep Dive')).toBeInTheDocument();
      });
    });

    it('should handle error states during report generation', async () => {
      // Mock report generation to fail
      const reportGeneratorModule = require('../lib/utils/reportGenerator');
      reportGeneratorModule.generateMonthlyReport.mockRejectedValue(new Error('PDF generation failed'));

      render(<ReportsPage />);

      // Start report generation
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Choose a report template')).toBeInTheDocument();
      });

      // Select template and generate
      const templateCards = screen.getAllByTestId('card');
      fireEvent.click(templateCards[0]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      const finalGenerateButton = screen.getByText('Generate Report');
      fireEvent.click(finalGenerateButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/PDF generation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Report Management Integration', () => {
    it('should handle complete download workflow', async () => {
      // Pre-populate with a generated report
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      const existingReports = [
        {
          id: 'test-report-1',
          title: 'Test Sustainability Report',
          description: 'Monthly sustainability overview',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '2.1 MB',
          status: 'ready',
          templateId: 'monthly-sustainability'
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingReports));

      render(<ReportsPage />);

      // Verify report appears
      await waitFor(() => {
        expect(screen.getByText('Test Sustainability Report')).toBeInTheDocument();
      });

      // Click download button
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      // Verify download process starts (would trigger blob download in real scenario)
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('should handle report preview workflow', async () => {
      // Pre-populate with a report that has blob data
      const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
      
      // Override the default mock for this specific test
      mockUseReports.mockReturnValue({
        reports: [
          {
            id: 'test-report-1',
            title: 'Preview Test Report',
            description: 'Test report for preview',
            lastGenerated: '2024-01-15',
            type: 'PDF',
            size: '1.8 MB',
            status: 'ready',
            blob: mockBlob,
            templateId: 'executive-summary'
          }
        ],
        templates: [
          {
            id: 'executive-summary',
            name: 'Executive Summary Report',
            description: 'High-level overview for stakeholders',
            sections: [
              { type: 'summary', title: 'Key Metrics' },
              { type: 'chart', title: 'Performance Summary' }
            ]
          }
        ],
        isGenerating: false,
        error: null,
        generateReport: jest.fn(),
        downloadReport: jest.fn(),
        previewReport: jest.fn(),
        deleteReport: jest.fn(),
        scheduleReport: jest.fn()
      });

      render(<ReportsPage />);

      // Click preview button
      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);

      // Verify preview opens new window
      expect(window.open).toHaveBeenCalledWith('mocked-url', '_blank');
    });

    it('should handle report deletion workflow', async () => {
      // Pre-populate with multiple reports
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      const existingReports = [
        {
          id: 'report-1',
          title: 'Report to Delete',
          description: 'This will be deleted',
          lastGenerated: '2024-01-15',
          type: 'PDF',
          size: '1.5 MB',
          status: 'ready',
          templateId: 'monthly-sustainability'
        },
        {
          id: 'report-2',
          title: 'Report to Keep',
          description: 'This will remain',
          lastGenerated: '2024-01-14',
          type: 'PDF',
          size: '1.2 MB',
          status: 'ready',
          templateId: 'executive-summary'
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingReports));

      render(<ReportsPage />);

      // Verify both reports appear
      expect(screen.getByText('Report to Delete')).toBeInTheDocument();
      expect(screen.getByText('Report to Keep')).toBeInTheDocument();

      // Delete first report
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Verify first report is removed but second remains
      await waitFor(() => {
        expect(screen.queryByText('Report to Delete')).not.toBeInTheDocument();
        expect(screen.getByText('Report to Keep')).toBeInTheDocument();
      });
    });
  });

  describe('Data Integration and Error Handling', () => {
    it('should handle missing dashboard data gracefully', async () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<ReportsPage />);

      // Generate report with no dashboard data
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Choose a report template/i)).toBeInTheDocument();
      });

      // Select template and generate
      const templateCards = screen.getAllByTestId('card');
      fireEvent.click(templateCards[0]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      const finalGenerateButton = screen.getByText('Generate Report');
      fireEvent.click(finalGenerateButton);

      // Should complete successfully using mock data
      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
    });

    it('should handle dashboard loading state', async () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      render(<ReportsPage />);

      // Should show loading state or handle gracefully
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('should handle dashboard error state', async () => {
      mockUseDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load dashboard data',
        refetch: jest.fn()
      });

      render(<ReportsPage />);

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      });

      render(<ReportsPage />);

      // Should handle unauthenticated state
      expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
    });
  });

  describe('Performance and State Management', () => {
    it('should maintain state consistency during multiple operations', async () => {
      render(<ReportsPage />);

      // Perform multiple operations in sequence
      
      // 1. Generate first report
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Choose a report template')).toBeInTheDocument();
      });

      const templateCards = screen.getAllByTestId('card');
      fireEvent.click(templateCards[0]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Custom Title (Optional)');
      fireEvent.change(titleInput, { target: { value: 'First Report' } });

      const generateReportButton = screen.getByText('Generate Report');
      fireEvent.click(generateReportButton);

      // Wait for first report to complete
      await waitFor(() => {
        expect(screen.getByText('First Report')).toBeInTheDocument();
      });

      // 2. Generate second report
      const generateButton2 = screen.getByText('Generate New Report');
      fireEvent.click(generateButton2);

      await waitFor(() => {
        expect(screen.getByText('Choose a report template')).toBeInTheDocument();
      });

      fireEvent.click(templateCards[1]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      const titleInput2 = screen.getByLabelText('Custom Title (Optional)');
      fireEvent.change(titleInput2, { target: { value: 'Second Report' } });

      const generateReportButton2 = screen.getByText('Generate Report');
      fireEvent.click(generateReportButton2);

      // Verify both reports exist
      await waitFor(() => {
        expect(screen.getByText('First Report')).toBeInTheDocument();
        expect(screen.getByText('Second Report')).toBeInTheDocument();
      });
    });

    it('should handle concurrent report generation attempts', async () => {
      render(<ReportsPage />);

      // Start first generation
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Choose a report template')).toBeInTheDocument();
      });

      const templateCards = screen.getAllByTestId('card');
      fireEvent.click(templateCards[0]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      // Start generation process
      const generateReportButton = screen.getByText('Generate Report');
      fireEvent.click(generateReportButton);

      // While generating, button should be disabled
      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      });

      // Generate button should be disabled during generation
      const disabledButton = screen.getByText('Generating...');
      expect(disabledButton).toBeDisabled();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should persist and restore reports from localStorage', async () => {
      // Pre-populate localStorage
      const localStorageMock = window.localStorage as jest.Mocked<Storage>;
      const savedReports = [
        {
          id: 'persistent-report',
          title: 'Persistent Report',
          description: 'Saved across sessions',
          lastGenerated: '2024-01-10',
          type: 'PDF',
          size: '1.8 MB',
          status: 'ready',
          templateId: 'executive-summary'
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedReports));

      render(<ReportsPage />);

      // Verify report loaded from localStorage
      expect(screen.getByText('Persistent Report')).toBeInTheDocument();
      expect(screen.getByText('Saved across sessions')).toBeInTheDocument();

      // Generate new report
      const generateButton = screen.getByText('Generate New Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Choose a report template')).toBeInTheDocument();
      });

      const templateCards = screen.getAllByTestId('card');
      fireEvent.click(templateCards[0]);

      await waitFor(() => {
        expect(screen.getByText('Customize Report')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Custom Title (Optional)');
      fireEvent.change(titleInput, { target: { value: 'New Session Report' } });

      const generateReportButton = screen.getByText('Generate Report');
      fireEvent.click(generateReportButton);

      // Verify both old and new reports exist
      await waitFor(() => {
        expect(screen.getByText('Persistent Report')).toBeInTheDocument();
        expect(screen.getByText('New Session Report')).toBeInTheDocument();
      });

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
}); 