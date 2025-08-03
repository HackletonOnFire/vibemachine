import { ReportGenerator, ReportTemplate, ReportData } from '../lib/utils/reportGenerator';
import { DashboardData } from '../hooks/useDashboardData';

// Mock dashboard data for testing
const mockDashboardData: DashboardData = {
  user: {
    name: 'Test User',
    businessName: 'Test Company',
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
      { title: 'Energy Management System', completed: false, dueDate: '2024-09-30' }
    ]
  },
  recommendations: [
    {
      priority: 'high' as const,
      title: 'Smart HVAC System',
      description: 'Install smart HVAC controls',
      potentialSavings: 3500,
      co2Reduction: 4.2,
      implementationCost: 8000,
      paybackPeriod: 27
    }
  ],
  lastUpdated: '2024-01-15T10:30:00Z'
};

describe('Template Generation Tests', () => {
  let templates: ReportTemplate[];

  beforeAll(() => {
    templates = ReportGenerator.getReportTemplates();
  });

  it('should have multiple distinct templates available', () => {
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(1);
    expect(templates.length).toEqual(6); // We expect 6 templates

    // Check template IDs are unique
    const templateIds = templates.map(t => t.id);
    const uniqueIds = new Set(templateIds);
    expect(uniqueIds.size).toEqual(templates.length);
  });

  it('should have templates with different configurations', () => {
    // Verify each template has different properties
    const templateConfigs = templates.map(t => ({
      id: t.id,
      name: t.name,
      sectionCount: t.sections.length,
      sectionTypes: t.sections.map(s => s.type).sort().join(','),
      primaryColor: t.branding?.primaryColor
    }));

    // All templates should have unique names
    const names = templateConfigs.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toEqual(templates.length);

    // All templates should have different section configurations
    const sectionConfigs = templateConfigs.map(t => t.sectionTypes);
    const uniqueConfigs = new Set(sectionConfigs);
    expect(uniqueConfigs.size).toBeGreaterThan(1); // At least some should be different

    console.log('📋 Available Templates:');
    templateConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.name} (${config.id})`);
      console.log(`   - Sections: ${config.sectionCount}`);
      console.log(`   - Section types: ${config.sectionTypes}`);
      console.log(`   - Primary color: ${config.primaryColor}`);
    });
  });

  it('should generate different PDF sizes for different templates', async () => {
    const pdfSizes: { template: string; size: number }[] = [];

    // Test first 3 templates to avoid too long test execution
    for (let i = 0; i < Math.min(3, templates.length); i++) {
      const template = templates[i];
      
      const reportData: ReportData = {
        title: `Test Report - ${template.name}`,
        generatedDate: new Date().toLocaleDateString(),
        reportPeriod: 'January 2024',
        dashboardData: mockDashboardData,
        template
      };

      const pdfBlob = await ReportGenerator.generatePDF(reportData);
      
      expect(pdfBlob).toBeDefined();
      expect(pdfBlob.type).toBe('application/pdf');
      expect(pdfBlob.size).toBeGreaterThan(0);

      pdfSizes.push({
        template: template.name,
        size: pdfBlob.size
      });

      console.log(`✅ Generated PDF for ${template.name}: ${(pdfBlob.size / 1024).toFixed(1)} KB`);
    }

    // PDFs should have different sizes (indicating different content)
    const uniqueSizes = new Set(pdfSizes.map(p => p.size));
    expect(uniqueSizes.size).toBeGreaterThan(1);

    console.log('\n📊 PDF Generation Results:');
    pdfSizes.forEach(({ template, size }) => {
      console.log(`- ${template}: ${(size / 1024).toFixed(1)} KB`);
    });
  });

  it('should have specific expected templates', () => {
    const expectedTemplates = [
      'executive-summary',
      'technical-deep-dive',
      'regulatory-compliance',
      'investor-relations',
      'stakeholder-update',
      'monthly-sustainability'
    ];

    const actualTemplateIds = templates.map(t => t.id);
    
    expectedTemplates.forEach(expectedId => {
      expect(actualTemplateIds).toContain(expectedId);
    });

    console.log('✅ All expected templates are present');
  });

  it('should have templates with appropriate sections for their purpose', () => {
    const executiveSummary = templates.find(t => t.id === 'executive-summary');
    const technicalDeepDive = templates.find(t => t.id === 'technical-deep-dive');
    const regulatory = templates.find(t => t.id === 'regulatory-compliance');

    expect(executiveSummary).toBeDefined();
    expect(technicalDeepDive).toBeDefined();
    expect(regulatory).toBeDefined();

    // Executive summary should have fewer sections (high-level)
    expect(executiveSummary!.sections.length).toBeLessThanOrEqual(4);
    
    // Technical deep dive should have detailed sections
    expect(technicalDeepDive!.sections.some(s => s.type === 'table')).toBe(true);
    
    // Regulatory should have compliance-focused sections
    expect(regulatory!.sections.some(s => s.title.toLowerCase().includes('compliance'))).toBe(true);

    console.log('✅ Template sections are appropriate for their purposes');
  });

  it('should have unique branding colors for different templates', () => {
    const brandingColors = templates.map(t => ({
      id: t.id,
      primary: t.branding?.primaryColor,
      secondary: t.branding?.secondaryColor,
      accent: t.branding?.accentColor
    }));

    // Not all templates should have the same branding
    const uniquePrimaryColors = new Set(brandingColors.map(b => b.primary));
    expect(uniquePrimaryColors.size).toBeGreaterThan(1);

    console.log('🎨 Template Branding:');
    brandingColors.forEach(({ id, primary, secondary, accent }) => {
      console.log(`- ${id}: Primary=${primary}, Secondary=${secondary}, Accent=${accent}`);
    });
  });
}); 