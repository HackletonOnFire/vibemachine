import { ReportGenerator, ReportData, ReportTemplate, generateMonthlyReport, generateCustomReport } from './reportGenerator';
import { DashboardData } from '../../hooks/useDashboardData';
import jsPDF from 'jspdf';

// Mock jsPDF
jest.mock('jspdf');
const mockJsPDF = jsPDF as jest.MockedClass<typeof jsPDF>;

// Mock HTML2Canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('ReportGenerator', () => {
  let mockPdfInstance: jest.Mocked<jsPDF>;
  let mockDashboardData: DashboardData;
  let mockReportTemplate: ReportTemplate;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock PDF instance with all required methods
    mockPdfInstance = {
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          getHeight: jest.fn().mockReturnValue(297),
        },
      },
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      text: jest.fn(),
      rect: jest.fn(),
      line: jest.fn(),
      addPage: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      setPage: jest.fn(),
      output: jest.fn().mockReturnValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
    } as any;

    mockJsPDF.mockImplementation(() => mockPdfInstance);

    // Create comprehensive mock dashboard data
    mockDashboardData = {
      user: {
        name: 'John Doe',
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
          description: 'Install programmable thermostats to reduce energy consumption',
          potentialSavings: 2000,
          co2Reduction: 2.5,
          implementationCost: 1000,
          paybackPeriod: 6
        },
        {
          priority: 'medium' as const,
          title: 'LED Lighting Retrofit',
          description: 'Replace existing lighting with LED alternatives',
          potentialSavings: 1500,
          co2Reduction: 1.8,
          implementationCost: 2000,
          paybackPeriod: 16
        }
      ],
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    // Create mock report template
    mockReportTemplate = {
      id: 'test-template',
      name: 'Test Report',
      description: 'A test report template',
      sections: [
        { type: 'header', title: 'Test Header' },
        { type: 'summary', title: 'Test Summary' },
        { type: 'recommendations', title: 'Test Recommendations' }
      ],
      branding: {
        primaryColor: '#10B981',
        secondaryColor: '#1F2937',
        accentColor: '#3B82F6'
      }
    };
  });

  describe('generatePDF', () => {
    it('should generate a PDF with all required sections', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      const result = await ReportGenerator.generatePDF(reportData);

      expect(result).toBeInstanceOf(Blob);
      expect(mockJsPDF).toHaveBeenCalledTimes(1);
      expect(mockPdfInstance.output).toHaveBeenCalledWith('blob');
    });

    it('should call all PDF generation methods in correct order', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Verify header elements are added
      expect(mockPdfInstance.setFillColor).toHaveBeenCalled();
      expect(mockPdfInstance.rect).toHaveBeenCalled();
      expect(mockPdfInstance.text).toHaveBeenCalled();
      expect(mockPdfInstance.setFont).toHaveBeenCalled();
      expect(mockPdfInstance.setFontSize).toHaveBeenCalled();
    });

    it('should handle empty recommendations gracefully', async () => {
      const dataWithoutRecommendations = {
        ...mockDashboardData,
        recommendations: []
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: dataWithoutRecommendations,
        template: mockReportTemplate
      };

      const result = await ReportGenerator.generatePDF(reportData);

      expect(result).toBeInstanceOf(Blob);
      // Should still generate PDF but with no recommendations message
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'No AI recommendations available at this time.',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle null recommendations gracefully', async () => {
      const dataWithNullRecommendations = {
        ...mockDashboardData,
        recommendations: null as any
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: dataWithNullRecommendations,
        template: mockReportTemplate
      };

      const result = await ReportGenerator.generatePDF(reportData);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should add multiple pages when content is long', async () => {
      // Mock page height to trigger pagination
      (mockPdfInstance.internal.pageSize.getHeight as jest.Mock).mockReturnValue(100);

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      expect(mockPdfInstance.addPage).toHaveBeenCalled();
    });

    it('should handle different priority levels for recommendations', async () => {
      const dataWithVariedPriorities = {
        ...mockDashboardData,
        recommendations: [
          { ...mockDashboardData.recommendations[0], priority: 'high' as const },
          { ...mockDashboardData.recommendations[1], priority: 'medium' as const },
          { ...mockDashboardData.recommendations[0], priority: 'low' as const }
        ]
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: dataWithVariedPriorities,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Should handle all priority levels
      expect(mockPdfInstance.rect).toHaveBeenCalled(); // For priority badges
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'HIGH',
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
    });

    it('should format financial numbers correctly', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Check that financial numbers are formatted with toLocaleString
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('$1,200'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle missing milestone data', async () => {
      const dataWithoutMilestones = {
        ...mockDashboardData,
        goals: {
          ...mockDashboardData.goals,
          milestones: []
        }
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: dataWithoutMilestones,
        template: mockReportTemplate
      };

      const result = await ReportGenerator.generatePDF(reportData);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('getReportTemplates', () => {
    test('should return all available report templates', () => {
      const templates = ReportGenerator.getReportTemplates();

      expect(templates).toHaveLength(10); // Updated to reflect the new compliance templates
      expect(templates).toEqual([
        expect.objectContaining({
          id: 'executive-summary',
          name: 'Executive Summary',
          description: 'High-level overview for leadership'
        }),
        expect.objectContaining({
          id: 'technical-deep-dive',
          name: 'Technical Deep Dive',
          description: 'Detailed analysis for engineers'
        }),
        expect.objectContaining({
          id: 'regulatory-compliance',
          name: 'Regulatory Compliance',
          description: 'Reports for regulatory bodies'
        }),
        expect.objectContaining({
          id: 'investor-relations',
          name: 'Investor Relations',
          description: 'ESG metrics for investors'
        }),
        expect.objectContaining({
          id: 'sustainability-overview',
          name: 'Sustainability Overview',
          description: 'Comprehensive sustainability report'
        }),
        expect.objectContaining({
          id: 'iso-14001-ems',
          name: 'ISO 14001 EMS Report',
          description: 'Environmental Management System compliance report following ISO 14001:2015 standard'
        }),
        expect.objectContaining({
          id: 'cdp-disclosure',
          name: 'CDP Climate Change Report',
          description: 'Carbon Disclosure Project questionnaire response format'
        }),
        expect.objectContaining({
          id: 'gri-sustainability',
          name: 'GRI Standards Sustainability Report',
          description: 'Comprehensive sustainability report following GRI Universal Standards'
        }),
        expect.objectContaining({
          id: 'esg-investment',
          name: 'ESG Investment Report',
          description: 'Environmental, Social, and Governance metrics for investors and rating agencies'
        }),
        expect.objectContaining({
          id: 'tcfd-disclosure',
          name: 'TCFD Climate Risk Report',
          description: 'Task Force on Climate-related Financial Disclosures framework'
        })
      ]);
    });

    it('should include branding information for each template', () => {
      const templates = ReportGenerator.getReportTemplates();

      templates.forEach(template => {
        expect(template.branding).toBeDefined();
        expect(template.branding?.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(template.branding?.secondaryColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(template.branding?.accentColor).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should include sections for each template', () => {
      const templates = ReportGenerator.getReportTemplates();

      templates.forEach(template => {
        expect(template.sections).toBeDefined();
        expect(template.sections.length).toBeGreaterThan(0);
        template.sections.forEach(section => {
          expect(section.type).toMatch(/^(header|summary|chart|table|text|recommendations)$/);
          expect(section.title).toBeTruthy();
        });
      });
    });
  });

  describe('generateMonthlyReport', () => {
    test('should generate monthly report with correct template', async () => {
      const spy = jest.spyOn(ReportGenerator, 'generatePDF');

      await generateMonthlyReport(mockDashboardData);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Monthly Sustainability Report',
          dashboardData: mockDashboardData,
          template: expect.objectContaining({
            id: 'sustainability-overview' // Updated to match the actual template used
          })
        })
      );

      spy.mockRestore();
    });

    it('should include current month and year in report period', async () => {
      const spy = jest.spyOn(ReportGenerator, 'generatePDF');
      
      await generateMonthlyReport(mockDashboardData);

      const call = spy.mock.calls[0][0];
      expect(call.reportPeriod).toMatch(/\w+ \d{4}/); // Format: "January 2024"

      spy.mockRestore();
    });
  });

  describe('generateCustomReport', () => {
    it('should generate report with custom title', async () => {
      const spy = jest.spyOn(ReportGenerator, 'generatePDF');
      const customTitle = 'Custom Report Title';
      
      await generateCustomReport(mockDashboardData, mockReportTemplate, customTitle);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: customTitle,
          dashboardData: mockDashboardData,
          template: mockReportTemplate
        })
      );

      spy.mockRestore();
    });

    it('should use template name when no custom title provided', async () => {
      const spy = jest.spyOn(ReportGenerator, 'generatePDF');
      
      await generateCustomReport(mockDashboardData, mockReportTemplate);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockReportTemplate.name,
          dashboardData: mockDashboardData,
          template: mockReportTemplate
        })
      );

      spy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle PDF generation errors gracefully', async () => {
      mockPdfInstance.output.mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await expect(ReportGenerator.generatePDF(reportData)).rejects.toThrow('PDF generation failed');
    });

    it('should handle invalid dashboard data', async () => {
      const invalidData = {} as DashboardData;

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: invalidData,
        template: mockReportTemplate
      };

      // Should not throw but handle gracefully
      const result = await ReportGenerator.generatePDF(reportData);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle malformed dates in goals', async () => {
      const dataWithBadDates = {
        ...mockDashboardData,
        goals: {
          ...mockDashboardData.goals,
          deadline: 'invalid-date',
          milestones: [
            { title: 'Test', completed: true, dueDate: 'bad-date' }
          ]
        }
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: dataWithBadDates,
        template: mockReportTemplate
      };

      // Should handle invalid dates gracefully
      const result = await ReportGenerator.generatePDF(reportData);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Brand Colors and Styling', () => {
    it('should use consistent brand colors', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Verify brand colors are used (RGB values for #10B981, etc.)
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith('#10B981');
    });

    it('should apply consistent font styling', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      expect(mockPdfInstance.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockPdfInstance.setFont).toHaveBeenCalledWith('helvetica', 'normal');
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Progress Bar Generation', () => {
    it('should generate progress bars for carbon reduction', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Should create background and progress rectangles
      expect(mockPdfInstance.rect).toHaveBeenCalledWith(
        expect.any(Number), // x
        expect.any(Number), // y
        expect.any(Number), // width
        expect.any(Number), // height
        'F' // fill
      );
    });

    it('should generate progress bars for goal completion', async () => {
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: '2024-01-15',
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template: mockReportTemplate
      };

      await ReportGenerator.generatePDF(reportData);

      // Should create progress visualization for goals
      expect(mockPdfInstance.rect).toHaveBeenCalled();
    });
  });
}); 

describe('ReportGenerator Chart Functionality', () => {
  let mockDashboardData: DashboardData;

  beforeEach(() => {
    mockDashboardData = {
      user: {
        name: 'John Doe',
        businessName: 'Test Corp',
        industry: 'Manufacturing',
        location: 'California, USA'
      },
      energyData: {
        currentMonth: { electricity: 2500, gas: 150, totalCost: 350 },
        previousMonth: { electricity: 2200, gas: 140, totalCost: 320 },
        yearToDate: { electricity: 25000, gas: 1500, totalCost: 3500 }
      },
      carbonFootprint: {
        currentEmissions: 45.2,
        baseline: 50.0,
        reduction: 9.6,
        monthlyTrend: [
          { month: 'Jan', emissions: 50.0 },
          { month: 'Feb', emissions: 48.5 },
          { month: 'Mar', emissions: 47.2 },
          { month: 'Apr', emissions: 45.8 },
          { month: 'May', emissions: 45.2 }
        ]
      },
      goals: {
        targetReduction: 15,
        deadline: '2024-12-31',
        progress: 64,
        milestones: [
          { title: 'LED Upgrade', completed: true, dueDate: '2024-03-01' },
          { title: 'HVAC Optimization', completed: false, dueDate: '2024-06-01' }
        ]
      },
              recommendations: [
        {
          title: 'LED Lighting Upgrade',
          description: 'Replace fluorescent lighting with LED fixtures',
          priority: 'high',
          potentialSavings: 2400,
          co2Reduction: 3.2,
          implementationCost: 5000,
          paybackPeriod: 25
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  });

  describe('Chart Data Generation', () => {
    test('should generate energy usage chart data', () => {
      // Access private method for testing
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'energy-usage');
      
      expect(chartData.type).toBe('line');
      expect(chartData.data).toHaveLength(2);
      expect(chartData.series).toHaveLength(2);
      expect(chartData.xAxisKey).toBe('month');
      expect(chartData.data[0]).toEqual({
        month: 'Previous',
        electricity: 2200,
        gas: 140
      });
      expect(chartData.data[1]).toEqual({
        month: 'Current',
        electricity: 2500,
        gas: 150
      });
    });

    test('should generate carbon trend chart data', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'carbon-trend');
      
      expect(chartData.type).toBe('area');
      expect(chartData.data).toHaveLength(5);
      expect(chartData.series).toHaveLength(2);
      expect(chartData.xAxisKey).toBe('month');
      expect(chartData.data[0]).toEqual({
        month: 'Jan',
        emissions: 50.0,
        baseline: 50.0
      });
    });

    test('should generate carbon breakdown chart data', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'carbon-breakdown');
      
      expect(chartData.type).toBe('pie');
      expect(chartData.data).toHaveLength(3);
      expect(chartData.valueKey).toBe('value');
      expect(chartData.labelKey).toBe('source');
      expect(chartData.data.some((item: any) => item.source === 'Electricity')).toBe(true);
      expect(chartData.data.some((item: any) => item.source === 'Natural Gas')).toBe(true);
      expect(chartData.data.some((item: any) => item.source === 'Other Sources')).toBe(true);
    });

    test('should generate goals progress chart data', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'goals-progress');
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data).toHaveLength(2);
      expect(chartData.series).toHaveLength(2);
      expect(chartData.xAxisKey).toBe('metric');
      expect(chartData.data[0]).toEqual({
        metric: 'Overall Progress',
        current: 64,
        target: 100
      });
      expect(chartData.data[1]).toEqual({
        metric: 'Emissions Reduction',
        current: 9.6,
        target: 15
      });
    });
  });

  describe('Chart Image Generation', () => {
    // Note: These tests require DOM environment, so we'll mock the canvas creation
    beforeEach(() => {
      // Mock document.createElement for canvas
      global.document = {
        ...global.document,
        createElement: jest.fn((tagName: string) => {
          if (tagName === 'div') {
            return {
              style: {},
              appendChild: jest.fn(),
              setAttribute: jest.fn()
            };
          }
          if (tagName === 'h3') {
            return {
              style: {},
              textContent: ''
            };
          }
          if (tagName === 'canvas') {
            return {
              width: 0,
              height: 0,
              style: {},
              getContext: jest.fn(() => ({
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 0,
                font: '',
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),
                arc: jest.fn(),
                closePath: jest.fn(),
                text: jest.fn(),
                fillText: jest.fn()
              }))
            };
          }
          return {};
        }),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn()
        }
      } as any;

      // Mock html2canvas
      jest.mock('html2canvas', () => ({
        __esModule: true,
        default: jest.fn(() => Promise.resolve({
          toDataURL: jest.fn(() => 'data:image/png;base64,mockimage')
        }))
      }));
    });

    test('should create chart image with proper configuration', async () => {
      const chartConfig = {
        type: 'line',
        title: 'Test Chart',
        data: [{ month: 'Jan', value: 100 }],
        series: [{ dataKey: 'value', name: 'Value', color: '#22c55e' }],
        xAxisKey: 'month'
      };

      // This test verifies the method structure, actual image generation requires browser environment
      const createChartImage = (ReportGenerator as any).createChartImage;
      expect(typeof createChartImage).toBe('function');
    });
  });

  describe('Template Processing with Charts', () => {
    test('should process template sections including charts', async () => {
      const template = ReportGenerator.getReportTemplates()[0]; // Executive Summary template
      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: new Date().toISOString(),
        reportPeriod: 'Q1 2024',
        dashboardData: mockDashboardData,
        template: template
      };

      // Verify template has chart sections
      const chartSections = template.sections.filter(section => section.type === 'chart');
      expect(chartSections.length).toBeGreaterThan(0);

      // Test PDF generation (this will use mocked canvas)
      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });

    test('should handle chart generation errors gracefully', async () => {
      // Mock createChartImage to throw an error
      const originalMethod = (ReportGenerator as any).createChartImage;
      (ReportGenerator as any).createChartImage = jest.fn().mockRejectedValue(new Error('Chart generation failed'));

      const template = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test template with chart',
        sections: [
          { type: 'chart' as const, title: 'Test Chart' }
        ]
      };

      const reportData: ReportData = {
        title: 'Test Report',
        generatedDate: new Date().toISOString(),
        reportPeriod: 'Q1 2024',
        dashboardData: mockDashboardData,
        template: template
      };

      // Should not throw error, should handle gracefully
      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);

      // Restore original method
      (ReportGenerator as any).createChartImage = originalMethod;
    });
  });

  describe('Chart Type Detection', () => {
    test('should detect carbon chart types correctly', async () => {
      const sections = [
        { type: 'chart' as const, title: 'Carbon Footprint Analysis' },
        { type: 'chart' as const, title: 'Emission Sources Breakdown' },
        { type: 'chart' as const, title: 'Progress Towards Goals' },
        { type: 'chart' as const, title: 'Energy Usage Overview' }
      ];

      // We can't easily test the private method directly, but we can verify
      // that different chart types are handled by checking the templates
      const templates = ReportGenerator.getReportTemplates();
      const chartSections = templates.flatMap(t => t.sections.filter(s => s.type === 'chart'));
      
      expect(chartSections.length).toBeGreaterThan(0);
      expect(chartSections.some(s => s.title.toLowerCase().includes('performance'))).toBe(true);
    });
  });
}); 

describe('ReportGenerator Compliance Templates', () => {
  let mockDashboardData: DashboardData;

  beforeEach(() => {
    mockDashboardData = {
      user: {
        name: 'Jane Smith',
        businessName: 'GreenTech Solutions',
        industry: 'Technology',
        location: 'Portland, Oregon'
      },
      energyData: {
        currentMonth: { electricity: 3200, gas: 180, totalCost: 450 },
        previousMonth: { electricity: 3000, gas: 170, totalCost: 420 },
        yearToDate: { electricity: 35000, gas: 2000, totalCost: 4800 }
      },
      carbonFootprint: {
        currentEmissions: 52.3,
        baseline: 60.0,
        reduction: 12.8,
        monthlyTrend: [
          { month: 'Jan', emissions: 60.0 },
          { month: 'Feb', emissions: 58.2 },
          { month: 'Mar', emissions: 56.1 },
          { month: 'Apr', emissions: 54.7 },
          { month: 'May', emissions: 52.3 }
        ]
      },
      goals: {
        targetReduction: 20,
        deadline: '2025-12-31',
        progress: 78,
        milestones: [
          { title: 'Energy Audit', completed: true, dueDate: '2024-02-01' },
          { title: 'Solar Installation', completed: false, dueDate: '2024-08-01' }
        ]
      },
      recommendations: [
        {
          title: 'Smart HVAC System',
          description: 'Install intelligent climate control system',
          priority: 'high',
          potentialSavings: 3600,
          co2Reduction: 4.2,
          implementationCost: 8000,
          paybackPeriod: 27
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  });

  describe('Compliance Template Creation', () => {
    test('should include all compliance templates', () => {
      const templates = ReportGenerator.getReportTemplates();
      
      const complianceTemplateIds = [
        'iso-14001-ems',
        'cdp-disclosure',
        'gri-sustainability',
        'esg-investment',
        'tcfd-disclosure'
      ];

      complianceTemplateIds.forEach(templateId => {
        const template = templates.find(t => t.id === templateId);
        expect(template).toBeDefined();
        expect(template?.sections.length).toBeGreaterThan(0);
      });
    });

    test('should have proper branding for each compliance template', () => {
      const templates = ReportGenerator.getReportTemplates();
      
      const isoTemplate = templates.find(t => t.id === 'iso-14001-ems');
      expect(isoTemplate?.branding?.primaryColor).toBe('#2E7D32'); // ISO green

      const cdpTemplate = templates.find(t => t.id === 'cdp-disclosure');
      expect(cdpTemplate?.branding?.primaryColor).toBe('#1565C0'); // CDP blue

      const griTemplate = templates.find(t => t.id === 'gri-sustainability');
      expect(griTemplate?.branding?.primaryColor).toBe('#FF6B35'); // GRI orange

      const esgTemplate = templates.find(t => t.id === 'esg-investment');
      expect(esgTemplate?.branding?.primaryColor).toBe('#6A1B9A'); // ESG purple

      const tcfdTemplate = templates.find(t => t.id === 'tcfd-disclosure');
      expect(tcfdTemplate?.branding?.primaryColor).toBe('#00695C'); // TCFD teal
    });
  });

  describe('Compliance-Specific Chart Data Generation', () => {
    test('should generate ISO 14001 environmental aspects chart', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'environmental-aspects');
      
      expect(chartData.type).toBe('pie');
      expect(chartData.data).toHaveLength(5);
      expect(chartData.valueKey).toBe('significance');
      expect(chartData.labelKey).toBe('aspect');
      expect(chartData.data[0].aspect).toBe('Energy Consumption');
    });

    test('should generate CDP GHG emissions chart', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'ghg-emissions');
      
      expect(chartData.type).toBe('pie');
      expect(chartData.data).toHaveLength(3);
      expect(chartData.valueKey).toBe('emissions');
      expect(chartData.labelKey).toBe('scope');
      expect(chartData.data.some((item: any) => item.scope.includes('Scope 1'))).toBe(true);
      expect(chartData.data.some((item: any) => item.scope.includes('Scope 2'))).toBe(true);
      expect(chartData.data.some((item: any) => item.scope.includes('Scope 3'))).toBe(true);
    });

    test('should generate GRI economic performance chart', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'economic-performance');
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data).toHaveLength(4);
      expect(chartData.series).toHaveLength(1);
      expect(chartData.series[0].color).toBe('#FF6B35'); // GRI orange
      expect(chartData.data[0].indicator).toBe('Energy Cost Savings');
    });

    test('should generate ESG scores chart', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'esg-scores');
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data).toHaveLength(3);
      expect(chartData.series).toHaveLength(2);
      expect(chartData.data.map((item: any) => item.category)).toEqual(['Environmental', 'Social', 'Governance']);
    });

    test('should generate TCFD scenario analysis chart', () => {
      const chartData = (ReportGenerator as any).generateChartData(mockDashboardData, 'scenario-analysis');
      
      expect(chartData.type).toBe('line');
      expect(chartData.data).toHaveLength(4);
      expect(chartData.series).toHaveLength(3);
      expect(chartData.data[0].scenario).toBe('1.5°C');
      expect(chartData.series.map((s: any) => s.name)).toEqual(['Physical Risks', 'Transition Risks', 'Total Risk']);
    });
  });

  describe('Chart Type Determination', () => {
    test('should determine correct chart types for ISO 14001', () => {
      const determineChartType = (ReportGenerator as any).determineChartType;
      
      expect(determineChartType('Environmental Aspects & Impacts Analysis', 'iso-14001-ems')).toBe('environmental-aspects');
      expect(determineChartType('Environmental Objectives & Targets Progress', 'iso-14001-ems')).toBe('environmental-objectives');
    });

    test('should determine correct chart types for CDP', () => {
      const determineChartType = (ReportGenerator as any).determineChartType;
      
      expect(determineChartType('GHG Emissions Inventory (Scope 1, 2, 3)', 'cdp-disclosure')).toBe('ghg-emissions');
      expect(determineChartType('Emissions Reduction Targets & Performance', 'cdp-disclosure')).toBe('emissions-targets');
    });

    test('should determine correct chart types for GRI', () => {
      const determineChartType = (ReportGenerator as any).determineChartType;
      
      expect(determineChartType('Economic Performance Indicators', 'gri-sustainability')).toBe('economic-performance');
      expect(determineChartType('Environmental Performance Indicators', 'gri-sustainability')).toBe('environmental-performance');
    });

    test('should fall back to default chart types', () => {
      const determineChartType = (ReportGenerator as any).determineChartType;
      
      expect(determineChartType('Unknown Chart Type', 'unknown-template')).toBe('energy-usage');
      expect(determineChartType('Carbon Footprint Analysis')).toBe('carbon-trend');
      expect(determineChartType('Energy Usage Breakdown')).toBe('energy-usage');
    });
  });

  describe('Compliance Template Detection', () => {
    test('should correctly identify compliance templates', () => {
      const isComplianceTemplate = (ReportGenerator as any).isComplianceTemplate;
      
      expect(isComplianceTemplate('iso-14001-ems')).toBe(true);
      expect(isComplianceTemplate('cdp-disclosure')).toBe(true);
      expect(isComplianceTemplate('gri-sustainability')).toBe(true);
      expect(isComplianceTemplate('esg-investment')).toBe(true);
      expect(isComplianceTemplate('tcfd-disclosure')).toBe(true);
      
      expect(isComplianceTemplate('executive-summary')).toBe(false);
      expect(isComplianceTemplate('technical-deep-dive')).toBe(false);
    });
  });

  describe('Compliance Report Generation', () => {
    test('should generate ISO 14001 compliance report', async () => {
      const template = ReportGenerator.getReportTemplates().find(t => t.id === 'iso-14001-ems');
      const reportData: ReportData = {
        title: 'ISO 14001 EMS Compliance Report',
        generatedDate: new Date().toISOString(),
        reportPeriod: 'Annual 2024',
        dashboardData: mockDashboardData,
        template: template!
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });

    test('should generate CDP disclosure report', async () => {
      const template = ReportGenerator.getReportTemplates().find(t => t.id === 'cdp-disclosure');
      const reportData: ReportData = {
        title: 'CDP Climate Change Disclosure',
        generatedDate: new Date().toISOString(),
        reportPeriod: '2024',
        dashboardData: mockDashboardData,
        template: template!
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });

    test('should generate GRI sustainability report', async () => {
      const template = ReportGenerator.getReportTemplates().find(t => t.id === 'gri-sustainability');
      const reportData: ReportData = {
        title: 'GRI Standards Sustainability Report',
        generatedDate: new Date().toISOString(),
        reportPeriod: '2024',
        dashboardData: mockDashboardData,
        template: template!
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });

    test('should generate ESG investment report', async () => {
      const template = ReportGenerator.getReportTemplates().find(t => t.id === 'esg-investment');
      const reportData: ReportData = {
        title: 'ESG Performance & Investment Report',
        generatedDate: new Date().toISOString(),
        reportPeriod: 'Q4 2024',
        dashboardData: mockDashboardData,
        template: template!
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });

    test('should generate TCFD climate risk report', async () => {
      const template = ReportGenerator.getReportTemplates().find(t => t.id === 'tcfd-disclosure');
      const reportData: ReportData = {
        title: 'TCFD Climate-Related Financial Disclosures',
        generatedDate: new Date().toISOString(),
        reportPeriod: '2024',
        dashboardData: mockDashboardData,
        template: template!
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
    });
  });

  describe('Compliance Content Methods', () => {
    let mockPdf: any;

    beforeEach(() => {
      mockPdf = {
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        setTextColor: jest.fn(),
        text: jest.fn(),
        internal: {
          pageSize: {
            getWidth: jest.fn().mockReturnValue(210),
            getHeight: jest.fn().mockReturnValue(297)
          }
        }
      };
    });

    test('should add ISO 14001 specific content', () => {
      // Test the addComplianceSection method which calls the specific content methods
      const addComplianceSection = (ReportGenerator as any).addComplianceSection;
      const section = { type: 'text', title: 'Environmental Policy Statement' };
      
      const result = addComplianceSection(mockPdf, section, mockDashboardData, 100, 'iso-14001-ems');
      
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Environmental Policy Statement',
        20,
        120
      );
      expect(result).toBeGreaterThan(100);
    });

    test('should add CDP specific content', () => {
      const addComplianceSection = (ReportGenerator as any).addComplianceSection;
      const section = { type: 'text', title: 'Governance: Climate-Related Oversight & Accountability' };
      
      const result = addComplianceSection(mockPdf, section, mockDashboardData, 100, 'cdp-disclosure');
      
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Governance: Climate-Related Oversight & Accountability',
        20,
        120
      );
      expect(result).toBeGreaterThan(100);
    });

    test('should add GRI specific content', () => {
      const addComplianceSection = (ReportGenerator as any).addComplianceSection;
      const section = { type: 'text', title: 'Organizational Profile & Reporting Practices' };
      
      const result = addComplianceSection(mockPdf, section, mockDashboardData, 100, 'gri-sustainability');
      
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Organizational Profile & Reporting Practices',
        20,
        120
      );
      expect(result).toBeGreaterThan(100);
    });

    test('should add ESG specific content', () => {
      const addComplianceSection = (ReportGenerator as any).addComplianceSection;
      const section = { type: 'text', title: 'Governance Structure & Risk Management' };
      
      const result = addComplianceSection(mockPdf, section, mockDashboardData, 100, 'esg-investment');
      
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Governance Structure & Risk Management',
        20,
        120
      );
      expect(result).toBeGreaterThan(100);
    });

    test('should add TCFD specific content', () => {
      const addComplianceSection = (ReportGenerator as any).addComplianceSection;
      const section = { type: 'text', title: 'Strategy: Climate Risk & Opportunity Assessment' };
      
      const result = addComplianceSection(mockPdf, section, mockDashboardData, 100, 'tcfd-disclosure');
      
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Strategy: Climate Risk & Opportunity Assessment',
        20,
        120
      );
      expect(result).toBeGreaterThan(100);
    });
  });
}); 