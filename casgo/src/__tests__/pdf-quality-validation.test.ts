import { ReportGenerator, generateMonthlyReport, generateCustomReport, getReportTemplates } from '../lib/utils/reportGenerator';
import jsPDF from 'jspdf';

// Mock jsPDF for testing
jest.mock('jspdf');
const mockJsPDF = jsPDF as jest.MockedClass<typeof jsPDF>;

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockCanvasData')
  })
}));

describe('PDF Output Quality and Professional Formatting Validation', () => {
  let mockPdfInstance: jest.Mocked<jsPDF>;

  const mockDashboardData = {
    user: {
      name: 'EcoMind Test Corp',
      businessName: 'Sustainable Tech Solutions',
      industry: 'Technology & Software',
      location: 'San Francisco, California'
    },
    energyData: {
      currentMonth: { electricity: 2500, gas: 1200, totalCost: 3200 },
      previousMonth: { electricity: 2800, gas: 1400, totalCost: 3600 },
      yearToDate: { electricity: 28000, gas: 14000, totalCost: 38000 }
    },
    carbonFootprint: {
      currentEmissions: 22.5,
      baseline: 35.0,
      reduction: 35.7,
      monthlyTrend: [
        { month: 'Jan', emissions: 35.0 },
        { month: 'Feb', emissions: 30.2 },
        { month: 'Mar', emissions: 28.1 },
        { month: 'Apr', emissions: 25.8 },
        { month: 'May', emissions: 22.5 }
      ]
    },
    goals: {
      targetReduction: 40,
      deadline: '2025-12-31',
      progress: 89,
      milestones: [
        { title: 'Solar Panel Installation Complete', completed: true, dueDate: '2024-06-30' },
        { title: 'HVAC System Upgrade', completed: true, dueDate: '2024-08-15' },
        { title: 'LED Lighting Conversion', completed: true, dueDate: '2024-09-30' },
        { title: 'Smart Building Controls', completed: false, dueDate: '2024-12-31' },
        { title: 'Employee Training Program', completed: false, dueDate: '2025-03-31' }
      ]
    },
    recommendations: [
      {
        priority: 'high' as const,
        title: 'Advanced Energy Management System',
        description: 'Implement AI-powered energy management with predictive analytics and automated optimization',
        potentialSavings: 15000,
        co2Reduction: 8.5,
        implementationCost: 45000,
        paybackPeriod: 36
      },
      {
        priority: 'high' as const,
        title: 'Battery Storage System',
        description: 'Install commercial-grade battery storage to optimize solar energy usage and reduce peak demand charges',
        potentialSavings: 12000,
        co2Reduction: 6.2,
        implementationCost: 75000,
        paybackPeriod: 75
      },
      {
        priority: 'medium' as const,
        title: 'Smart Window Tinting',
        description: 'Upgrade to electrochromic smart windows that automatically adjust tint based on sunlight',
        potentialSavings: 8500,
        co2Reduction: 4.1,
        implementationCost: 35000,
        paybackPeriod: 49
      },
      {
        priority: 'medium' as const,
        title: 'Water Recycling System',
        description: 'Implement greywater recycling system for irrigation and cooling tower makeup water',
        potentialSavings: 5200,
        co2Reduction: 2.8,
        implementationCost: 28000,
        paybackPeriod: 65
      },
      {
        priority: 'low' as const,
        title: 'Green Roof Installation',
        description: 'Convert existing roof space to green roof with native plants for natural insulation',
        potentialSavings: 3200,
        co2Reduction: 1.9,
        implementationCost: 22000,
        paybackPeriod: 83
      }
    ],
    lastUpdated: '2024-01-15T10:30:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPdfInstance = {
      addPage: jest.fn().mockReturnThis(),
      setPage: jest.fn().mockReturnThis(),
      setFontSize: jest.fn().mockReturnThis(),
      setFont: jest.fn().mockReturnThis(),
      setTextColor: jest.fn().mockReturnThis(),
      setFillColor: jest.fn().mockReturnThis(),
      setDrawColor: jest.fn().mockReturnThis(),
      setLineWidth: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      line: jest.fn().mockReturnThis(),
      circle: jest.fn().mockReturnThis(),
      addImage: jest.fn().mockReturnThis(),
      save: jest.fn().mockReturnThis(),
      output: jest.fn().mockReturnValue(new ArrayBuffer(1000)),
      internal: {
        pageSize: { width: 210, height: 297 },
        scaleFactor: 1,
        getCurrentPageInfo: jest.fn().mockReturnValue({ pageNumber: 1 })
      },
      getNumberOfPages: jest.fn().mockReturnValue(1),
      getCurrentPageInfo: jest.fn().mockReturnValue({ pageNumber: 1 }),
      splitTextToSize: jest.fn().mockImplementation((text, maxWidth) => [text]),
      getTextWidth: jest.fn().mockReturnValue(50),
      getLineHeight: jest.fn().mockReturnValue(5)
    } as any;

    mockJsPDF.mockImplementation(() => mockPdfInstance);
  });

  describe('Professional Header and Branding Validation', () => {
    it('should generate consistent header across all templates', async () => {
      const templates = getReportTemplates();
      
      for (const template of templates) {
        const blob = await generateCustomReport(mockDashboardData, template);
        
        // Verify PDF generation
        expect(mockJsPDF).toHaveBeenCalled();
        expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(24);
        expect(mockPdfInstance.text).toHaveBeenCalledWith(
          expect.stringContaining('EcoMind'),
          expect.any(Number),
          expect.any(Number)
        );
        
        // Verify branding colors are applied
        expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith(template.branding.primaryColor);
        
        // Verify blob is generated
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/pdf');
      }
    });

    it('should apply correct brand colors for each template', async () => {
      const templates = getReportTemplates();
      
      for (const template of templates) {
        jest.clearAllMocks();
        await generateCustomReport(mockDashboardData, template);
        
        // Verify primary color is used
        expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith(template.branding.primaryColor);
        expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(template.branding.primaryColor);
        
        // Verify secondary color is used for accents
        expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith(template.branding.secondaryColor);
      }
    });

    it('should include company logo placeholder and tagline', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify logo area is created
      expect(mockPdfInstance.rect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'S'
      );
      
      // Verify tagline is included
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Empowering Sustainable Business Decisions'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should include report generation timestamp', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/Generated on.*\d{4}/),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Executive Summary Professional Layout', () => {
    it('should create visually distinct metric boxes', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify multiple metric boxes are created
      const rectCalls = mockPdfInstance.rect.mock.calls.filter(call => 
        call[4] === 'F' // Filled rectangles for metric boxes
      );
      expect(rectCalls.length).toBeGreaterThan(3);
      
      // Verify metric values are displayed
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('22.5'),
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('35.7%'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should format financial metrics with proper currency formatting', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify currency formatting (should include $ and commas)
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/\$[\d,]+/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should display key metrics with appropriate precision', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify percentage formatting
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('35.7%'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify decimal precision for emissions
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('22.5'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Business Information Professional Display', () => {
    it('should format business details in structured layout', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify business name is prominently displayed
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        mockDashboardData.user.businessName,
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify industry and location are included
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining(mockDashboardData.user.industry),
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining(mockDashboardData.user.location),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle long business names gracefully', async () => {
      const longNameData = {
        ...mockDashboardData,
        user: {
          ...mockDashboardData.user,
          businessName: 'Very Long Business Name That Exceeds Normal Length Expectations And Should Be Handled Properly'
        }
      };
      
      await generateMonthlyReport(longNameData);
      
      // Verify text wrapping is used for long names
      expect(mockPdfInstance.splitTextToSize).toHaveBeenCalled();
    });
  });

  describe('Energy Data Table Formatting', () => {
    it('should create professional table layout for energy data', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify table headers are created
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Electricity'),
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Gas'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify table lines are drawn
      const lineCalls = mockPdfInstance.line.mock.calls;
      expect(lineCalls.length).toBeGreaterThan(5); // Multiple table lines
    });

    it('should format energy values with appropriate units', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify kWh units for electricity
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('kWh'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify currency formatting for costs
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/\$[\d,]+/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should create alternating row backgrounds for readability', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify alternating row backgrounds
      const fillRectCalls = mockPdfInstance.rect.mock.calls.filter(call => 
        call[4] === 'F' && call[2] > 100 // Wide filled rectangles for table rows
      );
      expect(fillRectCalls.length).toBeGreaterThan(1);
    });
  });

  describe('Carbon Footprint Visual Elements', () => {
    it('should create progress bars for carbon reduction metrics', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify progress bar elements
      const progressBarCalls = mockPdfInstance.rect.mock.calls.filter(call => 
        call[2] > 50 && call[3] < 10 // Wide, short rectangles for progress bars
      );
      expect(progressBarCalls.length).toBeGreaterThan(1);
      
      // Verify progress percentage is displayed
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('35.7%'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should format emissions data with proper precision', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify emissions values are displayed with one decimal place
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/\d+\.\d/),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify CO2 units
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('tons CO2'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Goals Progress Professional Display', () => {
    it('should create visual progress indicators for goals', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify main progress bar for overall goal
      expect(mockPdfInstance.rect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        8,
        'F'
      );
      
      // Verify progress percentage
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('89%'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should display milestone status with visual indicators', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify milestone titles are included
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Solar Panel Installation'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify completion status indicators (checkmarks/circles)
      expect(mockPdfInstance.circle).toHaveBeenCalled();
    });

    it('should format deadline dates consistently', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify deadline formatting
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('AI Recommendations Professional Layout', () => {
    it('should display priority badges with appropriate colors', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify priority badges are created with different colors
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith('#EF4444'); // High priority red
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith('#F59E0B'); // Medium priority orange
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith('#6B7280'); // Low priority gray
      
      // Verify priority text
      expect(mockPdfInstance.text).toHaveBeenCalledWith('HIGH', expect.any(Number), expect.any(Number));
      expect(mockPdfInstance.text).toHaveBeenCalledWith('MEDIUM', expect.any(Number), expect.any(Number));
      expect(mockPdfInstance.text).toHaveBeenCalledWith('LOW', expect.any(Number), expect.any(Number));
    });

    it('should format financial metrics professionally in recommendations', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify annual savings formatting
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('$15,000'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify implementation cost formatting
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('$45,000'),
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify payback period formatting
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('36 months'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle long recommendation descriptions with proper text wrapping', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify text wrapping is used for long descriptions
      expect(mockPdfInstance.splitTextToSize).toHaveBeenCalledWith(
        expect.stringContaining('Implement AI-powered energy management'),
        expect.any(Number)
      );
    });

    it('should create structured layout for multiple recommendations', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify multiple recommendation sections are created
      const recommendationTitles = mockPdfInstance.text.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Management System')
      );
      expect(recommendationTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Page Layout and Formatting Standards', () => {
    it('should maintain consistent margins across all pages', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify consistent left margin (20mm)
      const leftMarginCalls = mockPdfInstance.text.mock.calls.filter(call => 
        call[1] === 20
      );
      expect(leftMarginCalls.length).toBeGreaterThan(3);
    });

    it('should add page breaks when content exceeds page height', async () => {
      // Create data that would require multiple pages
      const largeData = {
        ...mockDashboardData,
        recommendations: Array.from({ length: 20 }, (_, i) => ({
          priority: 'high' as const,
          title: `Recommendation ${i + 1}`,
          description: 'A'.repeat(500),
          potentialSavings: 1000,
          co2Reduction: 1.0,
          implementationCost: 5000,
          paybackPeriod: 12
        }))
      };
      
      await generateMonthlyReport(largeData);
      
      // Verify new pages are added
      expect(mockPdfInstance.addPage).toHaveBeenCalled();
    });

    it('should include page numbers and footers on all pages', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify footer elements
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('EcoMind Sustainability Platform'),
        expect.any(Number),
        280 // Footer position
      );
      
      // Verify page numbering
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringMatching(/Page \d+ of \d+/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should maintain consistent font sizes for hierarchy', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify font size hierarchy
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(24); // Main title
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(18); // Section headers
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(14); // Subsection headers
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(10); // Body text
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(8);  // Footer text
    });
  });

  describe('PDF Output Quality Validation', () => {
    it('should generate valid PDF blob output', async () => {
      const blob = await generateMonthlyReport(mockDashboardData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle PDF generation errors gracefully', async () => {
      mockPdfInstance.output.mockImplementation(() => {
        throw new Error('PDF output failed');
      });
      
      await expect(generateMonthlyReport(mockDashboardData)).rejects.toThrow('PDF output failed');
    });

    it('should generate consistent output across multiple calls', async () => {
      const blob1 = await generateMonthlyReport(mockDashboardData);
      const blob2 = await generateMonthlyReport(mockDashboardData);
      
      expect(blob1.type).toBe(blob2.type);
      expect(blob1.size).toBe(blob2.size);
    });
  });

  describe('Template-Specific Formatting Validation', () => {
    it('should apply unique branding for each template', async () => {
      const templates = getReportTemplates();
      
      for (const template of templates) {
        jest.clearAllMocks();
        await generateCustomReport(mockDashboardData, template, `Custom ${template.name}`);
        
        // Verify template-specific branding is applied
        expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith(template.branding.primaryColor);
        expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(template.branding.primaryColor);
        
        // Verify custom title is used
        expect(mockPdfInstance.text).toHaveBeenCalledWith(
          `Custom ${template.name}`,
          expect.any(Number),
          expect.any(Number)
        );
      }
    });

    it('should maintain section consistency across templates', async () => {
      const templates = getReportTemplates();
      
      for (const template of templates) {
        jest.clearAllMocks();
        await generateCustomReport(mockDashboardData, template);
        
        // All templates should have header
        expect(mockPdfInstance.text).toHaveBeenCalledWith(
          expect.stringContaining('EcoMind'),
          expect.any(Number),
          expect.any(Number)
        );
        
        // All templates should have footer
        expect(mockPdfInstance.text).toHaveBeenCalledWith(
          expect.stringContaining('Confidential'),
          expect.any(Number),
          280
        );
      }
    });

    it('should handle missing template data gracefully', async () => {
      const incompleteTemplate = {
        id: 'incomplete',
        name: 'Incomplete Template',
        description: 'Missing sections',
        sections: [],
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#333333',
          accentColor: '#666666'
        }
      };
      
      const blob = await generateCustomReport(mockDashboardData, incompleteTemplate);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });
  });

  describe('Accessibility and Readability Standards', () => {
    it('should use high contrast colors for text readability', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify dark text colors are used for readability
      expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith('#1F2937');
      expect(mockPdfInstance.setTextColor).toHaveBeenCalledWith('#374151');
    });

    it('should maintain adequate line spacing for readability', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify line height is used for spacing
      expect(mockPdfInstance.getLineHeight).toHaveBeenCalled();
    });

    it('should use appropriate font weights for emphasis', async () => {
      await generateMonthlyReport(mockDashboardData);
      
      // Verify bold font is used for headers
      expect(mockPdfInstance.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockPdfInstance.setFont).toHaveBeenCalledWith('helvetica', 'normal');
    });
  });
}); 