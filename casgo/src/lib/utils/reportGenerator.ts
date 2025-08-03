import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DashboardData } from '../../hooks/useDashboardData';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export interface ReportSection {
  type: 'header' | 'summary' | 'chart' | 'table' | 'text' | 'recommendations';
  title: string;
  content?: any;
}

export interface ReportData {
  title: string;
  generatedDate: string;
  reportPeriod: string;
  dashboardData: DashboardData;
  template: ReportTemplate;
}

export class ReportGenerator {
  // EcoMind Brand Colors
  private static readonly BRAND_COLORS = {
    primary: '#10B981', // Green
    secondary: '#1F2937', // Dark Gray
    accent: '#3B82F6', // Blue
    light: '#F3F4F6', // Light Gray
    success: '#059669', // Dark Green
    warning: '#F59E0B', // Orange
    text: '#111827' // Almost Black
  };

  static async generatePDF(reportData: ReportData): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add professional header
    this.addReportHeader(pdf, reportData, pageWidth);
    
    let yPosition = 80; // Start below header

    // Process template sections dynamically
    for (const section of reportData.template.sections) {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }

      switch (section.type) {
        case 'header':
          yPosition = this.addSectionHeader(pdf, section, yPosition);
          break;
        case 'summary':
          yPosition = this.addExecutiveSummary(pdf, reportData.dashboardData, yPosition);
          break;
        case 'chart':
          yPosition = await this.addChartSection(pdf, reportData.dashboardData, section, yPosition, reportData.template.id);
          break;
        case 'table':
          yPosition = this.addEnergyData(pdf, reportData.dashboardData, yPosition);
          break;
        case 'text':
          // Use compliance-specific content for compliance templates
          if (this.isComplianceTemplate(reportData.template.id)) {
            yPosition = this.addComplianceSection(pdf, section, reportData.dashboardData, yPosition, reportData.template.id);
          } else {
            yPosition = this.addBusinessInfo(pdf, reportData.dashboardData, yPosition);
          }
          break;
        case 'recommendations':
          yPosition = this.addRecommendations(pdf, reportData.dashboardData, yPosition);
          break;
        default:
          // Add a generic section
          yPosition = this.addGenericSection(pdf, section, yPosition);
      }
      
      yPosition += 10; // Add spacing between sections
    }

    // Add footer to all pages
    this.addReportFooter(pdf);

    return pdf.output('blob');
  }

  /**
   * Check if template is a compliance template
   */
  private static isComplianceTemplate(templateId: string): boolean {
    const complianceTemplates = [
      'iso-14001-ems',
      'cdp-disclosure', 
      'gri-sustainability',
      'esg-investment',
      'tcfd-disclosure'
    ];
    return complianceTemplates.includes(templateId);
  }

  private static addReportHeader(pdf: jsPDF, reportData: ReportData, pageWidth: number): void {
    // Add EcoMind branding header with colored background
    pdf.setFillColor(this.BRAND_COLORS.primary);
    pdf.rect(0, 0, pageWidth, 25, 'F');

    // EcoMind Logo area (text-based for now)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EcoMind', 15, 16);

    // Tagline
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Powered Sustainability Solutions', 15, 21);

    // Report title
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportData.title, pageWidth / 2, 45, { align: 'center' });

    // Subtitle with generation info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.secondary);
    pdf.text(`Generated: ${reportData.generatedDate} | Period: ${reportData.reportPeriod}`, pageWidth / 2, 55, { align: 'center' });

    // Decorative line
    pdf.setDrawColor(this.BRAND_COLORS.primary);
    pdf.setLineWidth(1);
    pdf.line(20, 65, pageWidth - 20, 65);
  }

  private static addExecutiveSummary(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header with colored background
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 20, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, yPosition + 8);
    yPosition += 25;

    // Key metrics in a box layout
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const metrics = [
      { label: 'Current Emissions', value: `${data.carbonFootprint.currentEmissions} tons CO2e`, color: this.BRAND_COLORS.warning },
      { label: 'Reduction Achieved', value: `${data.carbonFootprint.reduction}%`, color: this.BRAND_COLORS.success },
      { label: 'Monthly Energy Cost', value: `$${data.energyData.currentMonth.totalCost.toLocaleString()}`, color: this.BRAND_COLORS.accent },
      { label: 'Goal Progress', value: `${data.goals.progress}%`, color: this.BRAND_COLORS.primary }
    ];

    const boxWidth = 40;
    const boxHeight = 25;
    const startX = 20;
    let currentX = startX;

    metrics.forEach((metric, index) => {
      if (index === 2) {
        currentX = startX;
        yPosition += boxHeight + 5;
      }

      // Draw metric box
      pdf.setFillColor(metric.color);
      pdf.rect(currentX, yPosition, boxWidth, boxHeight, 'F');
      
      // Add metric text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.label, currentX + boxWidth/2, yPosition + 10, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(metric.value, currentX + boxWidth/2, yPosition + 18, { align: 'center' });
      
      currentX += boxWidth + 10;
    });

    yPosition += boxHeight + 20;
    return yPosition;
  }

  private static addBusinessInfo(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Business Profile', 20, yPosition + 5);
    yPosition += 20;

    // Business info in two columns
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const leftColumn = [
      `Business Name: ${data.user.businessName}`,
      `Industry: ${data.user.industry}`
    ];
    
    const rightColumn = [
      `Contact: ${data.user.name}`,
      `Location: ${data.user.location}`
    ];

    leftColumn.forEach((text, index) => {
      pdf.text(text, 20, yPosition + (index * 8));
    });

    rightColumn.forEach((text, index) => {
      pdf.text(text, 110, yPosition + (index * 8));
    });

    yPosition += Math.max(leftColumn.length, rightColumn.length) * 8 + 15;
    return yPosition;
  }

  private static addEnergyData(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 100) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Energy Consumption Analysis', 20, yPosition + 5);
    yPosition += 25;

    // Create a table-like layout
    pdf.setFontSize(10);
    
    // Table headers
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(this.BRAND_COLORS.secondary);
    const headers = ['Period', 'Electricity (kWh)', 'Gas (therms)', 'Total Cost'];
    const colWidths = [35, 35, 30, 30];
    let currentX = 20;

    headers.forEach((header, index) => {
      pdf.text(header, currentX, yPosition);
      currentX += colWidths[index];
    });
    yPosition += 8;

    // Table data
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);
    
    const rows = [
      ['Current Month', data.energyData.currentMonth.electricity.toLocaleString(), 
       data.energyData.currentMonth.gas.toLocaleString(), 
       `$${data.energyData.currentMonth.totalCost.toLocaleString()}`],
      ['Previous Month', data.energyData.previousMonth.electricity.toLocaleString(), 
       data.energyData.previousMonth.gas.toLocaleString(), 
       `$${data.energyData.previousMonth.totalCost.toLocaleString()}`],
      ['Year to Date', data.energyData.yearToDate.electricity.toLocaleString(), 
       data.energyData.yearToDate.gas.toLocaleString(), 
       `$${data.energyData.yearToDate.totalCost.toLocaleString()}`]
    ];

    rows.forEach((row, rowIndex) => {
      currentX = 20;
      // Alternate row background
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, yPosition - 3, pdf.internal.pageSize.getWidth() - 30, 10, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        pdf.text(cell, currentX, yPosition);
        currentX += colWidths[colIndex];
      });
      yPosition += 10;
    });

    yPosition += 15;
    return yPosition;
  }

  private static addCarbonFootprint(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Carbon Footprint Analysis', 20, yPosition + 5);
    yPosition += 25;

    // Carbon metrics with visual progress bars
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const metrics = [
      { label: 'Current Emissions', value: data.carbonFootprint.currentEmissions, unit: 'tons CO2e' },
      { label: 'Baseline', value: data.carbonFootprint.baseline, unit: 'tons CO2e' },
      { label: 'Reduction Achieved', value: data.carbonFootprint.reduction, unit: '%' }
    ];

    metrics.forEach((metric, index) => {
      pdf.text(`${metric.label}: ${metric.value} ${metric.unit}`, 20, yPosition);
      
      // Add progress bar for reduction
      if (metric.label === 'Reduction Achieved') {
        const barWidth = 100;
        const barHeight = 6;
        const progressWidth = (metric.value / 100) * barWidth;
        
        // Background bar
        pdf.setFillColor(220, 220, 220);
        pdf.rect(130, yPosition - 4, barWidth, barHeight, 'F');
        
        // Progress bar
        pdf.setFillColor(this.BRAND_COLORS.success);
        pdf.rect(130, yPosition - 4, progressWidth, barHeight, 'F');
      }
      
      yPosition += 12;
    });

    yPosition += 15;
    return yPosition;
  }

  private static addGoalsProgress(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 100) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sustainability Goals & Progress', 20, yPosition + 5);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Target Reduction: ${data.goals.targetReduction}%`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Deadline: ${new Date(data.goals.deadline).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    
    // Progress bar
    pdf.text(`Overall Progress: ${data.goals.progress}%`, 20, yPosition);
    const barWidth = 120;
    const barHeight = 8;
    const progressWidth = (data.goals.progress / 100) * barWidth;
    
    // Background bar
    pdf.setFillColor(220, 220, 220);
    pdf.rect(20, yPosition + 5, barWidth, barHeight, 'F');
    
    // Progress bar
    pdf.setFillColor(this.BRAND_COLORS.primary);
    pdf.rect(20, yPosition + 5, progressWidth, barHeight, 'F');
    
    yPosition += 20;

    // Milestones
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Milestones:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    data.goals.milestones.forEach(milestone => {
      const status = milestone.completed ? '✓' : '○';
      const statusColor = milestone.completed ? this.BRAND_COLORS.success : this.BRAND_COLORS.warning;
      
      pdf.setTextColor(statusColor);
      pdf.text(status, 25, yPosition);
      pdf.setTextColor(this.BRAND_COLORS.text);
      pdf.text(`${milestone.title} (Due: ${new Date(milestone.dueDate).toLocaleDateString()})`, 35, yPosition);
      yPosition += 8;
    });

    yPosition += 15;
    return yPosition;
  }

  private static addRecommendations(pdf: jsPDF, data: DashboardData, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      yPosition = 30;
    }

    // Section header
    pdf.setFillColor(this.BRAND_COLORS.light);
    pdf.rect(15, yPosition - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
    
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI-Powered Recommendations', 20, yPosition + 5);
    yPosition += 25;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Debug: Check if recommendations exist
    console.log('Dashboard Data Recommendations:', data.recommendations);
    
    if (!data.recommendations || data.recommendations.length === 0) {
      pdf.setTextColor(this.BRAND_COLORS.warning);
      pdf.text('No AI recommendations available at this time.', 20, yPosition);
      pdf.text('Complete your energy data collection to receive personalized recommendations.', 20, yPosition + 10);
      return yPosition + 20;
    }
    
    data.recommendations.forEach((rec, index) => {
      // Check if we need a new page for each recommendation
      if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
        pdf.addPage();
        yPosition = 30;
      }

      // Priority indicator
      const priorityColor = rec.priority === 'high' ? this.BRAND_COLORS.warning : 
                           rec.priority === 'medium' ? this.BRAND_COLORS.accent : 
                           this.BRAND_COLORS.secondary;
      
      // Priority badge
      pdf.setFillColor(priorityColor);
      pdf.rect(15, yPosition - 2, 15, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(rec.priority.toUpperCase(), 22.5, yPosition + 3, { align: 'center' });

      // Recommendation title
      pdf.setTextColor(this.BRAND_COLORS.text);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${rec.title}`, 35, yPosition + 3);
      yPosition += 12;
      
      // Description
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(rec.description, 35, yPosition);
      yPosition += 10;

      // Financial metrics in a structured layout
      const metrics = [
        { label: 'Annual Savings', value: `$${rec.potentialSavings.toLocaleString()}`, icon: '$' },
        { label: 'CO2 Reduction', value: `${rec.co2Reduction} tons/year`, icon: '🌱' },
        { label: 'Implementation Cost', value: `$${rec.implementationCost.toLocaleString()}`, icon: '💰' },
        { label: 'Payback Period', value: `${rec.paybackPeriod} months`, icon: '📅' }
      ];

      const metricsPerRow = 2;
      const metricWidth = 80;
      
      metrics.forEach((metric, metricIndex) => {
        const col = metricIndex % metricsPerRow;
        const row = Math.floor(metricIndex / metricsPerRow);
        const x = 35 + (col * metricWidth);
        const y = yPosition + (row * 8);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(`${metric.label}:`, x, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(metric.value, x + 30, y);
      });

      yPosition += Math.ceil(metrics.length / metricsPerRow) * 8 + 15;

      // Separator line
      if (index < data.recommendations.length - 1) {
        pdf.setDrawColor(this.BRAND_COLORS.light);
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition - 5, pdf.internal.pageSize.getWidth() - 20, yPosition - 5);
      }
    });
    
    return yPosition;
  }

  private static addReportFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Footer background
      pdf.setFillColor(this.BRAND_COLORS.light);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Footer text
      pdf.setTextColor(this.BRAND_COLORS.secondary);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by EcoMind AI-Powered Sustainability Platform', 15, pageHeight - 10);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      
      // Confidentiality notice
      pdf.text('Confidential & Proprietary', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
  }

  /**
   * Generate chart data based on dashboard data and chart type
   */
  private static generateChartData(dashboardData: DashboardData, chartType: string): any {
    switch (chartType) {
      case 'energy-usage':
        return {
          type: 'line',
          data: [
            { month: 'Previous', electricity: dashboardData.energyData.previousMonth.electricity, gas: dashboardData.energyData.previousMonth.gas },
            { month: 'Current', electricity: dashboardData.energyData.currentMonth.electricity, gas: dashboardData.energyData.currentMonth.gas }
          ],
          series: [
            { dataKey: 'electricity', name: 'Electricity (kWh)', color: '#22c55e' },
            { dataKey: 'gas', name: 'Natural Gas (therms)', color: '#06b6d4' }
          ],
          xAxisKey: 'month'
        };

      case 'carbon-trend':
        return {
          type: 'area',
          data: dashboardData.carbonFootprint.monthlyTrend.map((item, index) => ({
            ...item,
            baseline: dashboardData.carbonFootprint.baseline
          })),
          series: [
            { dataKey: 'emissions', name: 'Current Emissions', color: '#ef4444' },
            { dataKey: 'baseline', name: 'Baseline', color: '#e5e7eb' }
          ],
          xAxisKey: 'month'
        };

      case 'carbon-breakdown':
        const currentEmissions = dashboardData.carbonFootprint.currentEmissions;
        const electricityEmissions = dashboardData.energyData.currentMonth.electricity * 0.5; // Rough calculation
        const gasEmissions = dashboardData.energyData.currentMonth.gas * 5.3; // Rough calculation
        const otherEmissions = currentEmissions - electricityEmissions - gasEmissions;
        
        return {
          type: 'pie',
          data: [
            { source: 'Electricity', value: electricityEmissions },
            { source: 'Natural Gas', value: gasEmissions },
            { source: 'Other Sources', value: Math.max(0, otherEmissions) }
          ],
          valueKey: 'value',
          labelKey: 'source'
        };

      case 'goals-progress':
        return {
          type: 'bar',
          data: [
            { metric: 'Overall Progress', current: dashboardData.goals.progress, target: 100 },
            { metric: 'Emissions Reduction', current: dashboardData.carbonFootprint.reduction, target: dashboardData.goals.targetReduction }
          ],
          series: [
            { dataKey: 'current', name: 'Current', color: '#22c55e' },
            { dataKey: 'target', name: 'Target', color: '#e5e7eb' }
          ],
          xAxisKey: 'metric'
        };

      // ISO 14001 specific charts
      case 'environmental-aspects':
        return {
          type: 'pie',
          data: [
            { aspect: 'Energy Consumption', significance: 35 },
            { aspect: 'Waste Generation', significance: 25 },
            { aspect: 'Water Usage', significance: 20 },
            { aspect: 'Air Emissions', significance: 15 },
            { aspect: 'Chemical Storage', significance: 5 }
          ],
          valueKey: 'significance',
          labelKey: 'aspect'
        };

      case 'environmental-objectives':
        return {
          type: 'bar',
          data: [
            { objective: 'Energy Reduction', target: 100, achieved: dashboardData.goals.progress },
            { objective: 'Waste Reduction', target: 100, achieved: 75 },
            { objective: 'Water Conservation', target: 100, achieved: 60 },
            { objective: 'Emissions Reduction', target: 100, achieved: dashboardData.carbonFootprint.reduction * 10 }
          ],
          series: [
            { dataKey: 'achieved', name: 'Achieved', color: '#22c55e' },
            { dataKey: 'target', name: 'Target', color: '#e5e7eb' }
          ],
          xAxisKey: 'objective'
        };

      // CDP specific charts
      case 'ghg-emissions':
        const scope1 = dashboardData.energyData.currentMonth.gas * 5.3; // Direct emissions
        const scope2 = dashboardData.energyData.currentMonth.electricity * 0.5; // Indirect emissions from electricity
        const scope3 = (scope1 + scope2) * 0.3; // Other indirect emissions (estimated)
        
        return {
          type: 'pie',
          data: [
            { scope: 'Scope 1 (Direct)', emissions: scope1 },
            { scope: 'Scope 2 (Electricity)', emissions: scope2 },
            { scope: 'Scope 3 (Other Indirect)', emissions: scope3 }
          ],
          valueKey: 'emissions',
          labelKey: 'scope'
        };

      case 'emissions-targets':
        return {
          type: 'line',
          data: dashboardData.carbonFootprint.monthlyTrend.map(item => ({
            ...item,
            target: dashboardData.carbonFootprint.baseline * (1 - dashboardData.goals.targetReduction / 100),
            projectedReduction: item.emissions * 0.95 // Projected reduction trajectory
          })),
          series: [
            { dataKey: 'emissions', name: 'Actual Emissions', color: '#ef4444' },
            { dataKey: 'target', name: 'Target', color: '#22c55e' },
            { dataKey: 'projectedReduction', name: 'Projected Path', color: '#06b6d4' }
          ],
          xAxisKey: 'month'
        };

      // GRI specific charts
      case 'economic-performance':
        return {
          type: 'bar',
          data: [
            { indicator: 'Energy Cost Savings', value: dashboardData.energyData.currentMonth.totalCost * 0.15 },
            { indicator: 'Efficiency Improvements', value: dashboardData.energyData.currentMonth.totalCost * 0.12 },
            { indicator: 'Sustainability Investments', value: 2500 },
            { indicator: 'Regulatory Compliance', value: 1200 }
          ],
          series: [{ dataKey: 'value', name: 'Value ($)', color: '#FF6B35' }],
          xAxisKey: 'indicator'
        };

      case 'environmental-performance':
        return {
          type: 'area',
          data: dashboardData.carbonFootprint.monthlyTrend.map((item, index) => ({
            month: item.month,
            energyIntensity: (dashboardData.energyData.currentMonth.electricity + dashboardData.energyData.currentMonth.gas) / (index + 1),
            waterIntensity: 15 - index * 0.5, // Mock water data
            wasteIntensity: 8 - index * 0.3 // Mock waste data
          })),
          series: [
            { dataKey: 'energyIntensity', name: 'Energy Intensity', color: '#22c55e' },
            { dataKey: 'waterIntensity', name: 'Water Intensity', color: '#06b6d4' },
            { dataKey: 'wasteIntensity', name: 'Waste Intensity', color: '#f59e0b' }
          ],
          xAxisKey: 'month'
        };

      // ESG specific charts
      case 'esg-scores':
        return {
          type: 'bar',
          data: [
            { category: 'Environmental', score: 75, benchmark: 68 },
            { category: 'Social', score: 82, benchmark: 73 },
            { category: 'Governance', score: 88, benchmark: 81 }
          ],
          series: [
            { dataKey: 'score', name: 'Our Score', color: '#6A1B9A' },
            { dataKey: 'benchmark', name: 'Industry Benchmark', color: '#e5e7eb' }
          ],
          xAxisKey: 'category'
        };

      case 'risk-assessment':
        return {
          type: 'pie',
          data: [
            { risk: 'Climate Risk', level: 35 },
            { risk: 'Regulatory Risk', level: 25 },
            { risk: 'Operational Risk', level: 20 },
            { risk: 'Reputational Risk', level: 15 },
            { risk: 'Financial Risk', level: 5 }
          ],
          valueKey: 'level',
          labelKey: 'risk'
        };

      // TCFD specific charts
      case 'scenario-analysis':
        return {
          type: 'line',
          data: [
            { scenario: '1.5°C', physical: 15, transition: 25, total: 40 },
            { scenario: '2°C', physical: 25, transition: 20, total: 45 },
            { scenario: '3°C', physical: 40, transition: 10, total: 50 },
            { scenario: '4°C', physical: 60, transition: 5, total: 65 }
          ],
          series: [
            { dataKey: 'physical', name: 'Physical Risks', color: '#ef4444' },
            { dataKey: 'transition', name: 'Transition Risks', color: '#f59e0b' },
            { dataKey: 'total', name: 'Total Risk', color: '#8b5cf6' }
          ],
          xAxisKey: 'scenario'
        };

      default:
        return {
          type: 'line',
          data: dashboardData.carbonFootprint.monthlyTrend,
          series: [{ dataKey: 'emissions', name: 'Emissions', color: '#22c55e' }],
          xAxisKey: 'month'
        };
    }
  }

  /**
   * Add specialized compliance content sections
   */
  private static addComplianceSection(
    pdf: jsPDF, 
    section: ReportSection, 
    dashboardData: DashboardData, 
    yPosition: number,
    templateId: string
  ): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Add section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.text(section.title, 20, yPosition);
    yPosition += 20;

    // Add compliance-specific content based on template
    switch (templateId) {
      case 'iso-14001-ems':
        yPosition = this.addISO14001Content(pdf, section, dashboardData, yPosition);
        break;
      case 'cdp-disclosure':
        yPosition = this.addCDPContent(pdf, section, dashboardData, yPosition);
        break;
      case 'gri-sustainability':
        yPosition = this.addGRIContent(pdf, section, dashboardData, yPosition);
        break;
      case 'esg-investment':
        yPosition = this.addESGContent(pdf, section, dashboardData, yPosition);
        break;
      case 'tcfd-disclosure':
        yPosition = this.addTCFDContent(pdf, section, dashboardData, yPosition);
        break;
      default:
        // Default content for other templates
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#6b7280');
        pdf.text('Specialized content for this section is being processed...', 20, yPosition);
        yPosition += 15;
    }

    return yPosition;
  }

  /**
   * Add ISO 14001 specific content
   */
  private static addISO14001Content(pdf: jsPDF, section: ReportSection, data: DashboardData, yPosition: number): number {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);

    switch (section.title.toLowerCase()) {
      case 'environmental policy statement':
        pdf.text('Environmental Policy Compliance: Committed to pollution prevention,', 20, yPosition);
        yPosition += 12;
        pdf.text('legal compliance, and continual improvement in environmental performance.', 20, yPosition);
        yPosition += 12;
        pdf.text(`Current emissions: ${data.carbonFootprint.currentEmissions} tons CO2e`, 20, yPosition);
        yPosition += 12;
        pdf.text(`Reduction achieved: ${data.carbonFootprint.reduction}% vs baseline`, 20, yPosition);
        break;

      case 'legal & regulatory compliance status':
        pdf.text('✓ Air Quality Standards - Compliant', 20, yPosition);
        yPosition += 12;
        pdf.text('✓ Waste Management Regulations - Compliant', 20, yPosition);
        yPosition += 12;
        pdf.text('✓ Water Discharge Permits - Compliant', 20, yPosition);
        yPosition += 12;
        pdf.text('⚠ Energy Efficiency Standards - Under Review', 20, yPosition);
        break;

      case 'operational controls & emergency preparedness':
        pdf.text('• Environmental Management Procedures: Implemented', 20, yPosition);
        yPosition += 12;
        pdf.text('• Emergency Response Plans: Current and tested', 20, yPosition);
        yPosition += 12;
        pdf.text('• Training Programs: 95% completion rate', 20, yPosition);
        yPosition += 12;
        pdf.text('• Document Control: ISO 14001 compliant system active', 20, yPosition);
        break;

      default:
        pdf.text('ISO 14001 EMS section content being generated...', 20, yPosition);
    }

    return yPosition + 20;
  }

  /**
   * Add CDP specific content
   */
  private static addCDPContent(pdf: jsPDF, section: ReportSection, data: DashboardData, yPosition: number): number {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);

    switch (section.title.toLowerCase()) {
      case 'governance: climate-related oversight & accountability':
        pdf.text('Board Oversight: Climate risks reviewed quarterly by board', 20, yPosition);
        yPosition += 12;
        pdf.text('Management Responsibility: Chief Sustainability Officer appointed', 20, yPosition);
        yPosition += 12;
        pdf.text('Climate Strategy: Integrated into business planning process', 20, yPosition);
        break;

      case 'climate-related financial disclosures':
        pdf.text(`Climate-related investments: $${(data.energyData.currentMonth.totalCost * 2).toLocaleString()}`, 20, yPosition);
        yPosition += 12;
        pdf.text(`Potential climate costs avoided: $${(data.energyData.currentMonth.totalCost * 0.3).toLocaleString()}`, 20, yPosition);
        yPosition += 12;
        pdf.text('Transition risk assessment: Low to moderate financial impact', 20, yPosition);
        break;

      case 'supply chain engagement on climate issues':
        pdf.text('Supplier engagement: 75% of key suppliers have emission targets', 20, yPosition);
        yPosition += 12;
        pdf.text('Procurement criteria: Climate considerations integrated', 20, yPosition);
        yPosition += 12;
        pdf.text('Supply chain emissions: Scope 3 tracking implemented', 20, yPosition);
        break;

      default:
        pdf.text('CDP disclosure section content being generated...', 20, yPosition);
    }

    return yPosition + 20;
  }

  /**
   * Add GRI specific content
   */
  private static addGRIContent(pdf: jsPDF, section: ReportSection, data: DashboardData, yPosition: number): number {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);

    switch (section.title.toLowerCase()) {
      case 'organizational profile & reporting practices':
        pdf.text(`Organization: ${data.user.businessName}`, 20, yPosition);
        yPosition += 12;
        pdf.text(`Industry: ${data.user.industry}`, 20, yPosition);
        yPosition += 12;
        pdf.text(`Location: ${data.user.location}`, 20, yPosition);
        yPosition += 12;
        pdf.text('Reporting Period: January 1 - December 31, 2024', 20, yPosition);
        break;

      case 'material topics & stakeholder engagement':
        pdf.text('Material Topics Identified:', 20, yPosition);
        yPosition += 12;
        pdf.text('• Energy Management (High Priority)', 25, yPosition);
        yPosition += 10;
        pdf.text('• GHG Emissions (High Priority)', 25, yPosition);
        yPosition += 10;
        pdf.text('• Waste & Water Management (Medium Priority)', 25, yPosition);
        yPosition += 10;
        pdf.text('• Supply Chain Sustainability (Medium Priority)', 25, yPosition);
        break;

      case 'social performance & community impact':
        pdf.text('Employee Engagement: Sustainability training provided to all staff', 20, yPosition);
        yPosition += 12;
        pdf.text('Community Relations: Local environmental initiatives supported', 20, yPosition);
        yPosition += 12;
        pdf.text('Health & Safety: Zero environmental incidents recorded', 20, yPosition);
        break;

      case 'governance, ethics & compliance':
        pdf.text('Ethics Policy: Environmental responsibility integrated', 20, yPosition);
        yPosition += 12;
        pdf.text('Compliance Management: Regular audits and assessments', 20, yPosition);
        yPosition += 12;
        pdf.text('Stakeholder Grievances: Environmental complaint process active', 20, yPosition);
        break;

      default:
        pdf.text('GRI Standards section content being generated...', 20, yPosition);
    }

    return yPosition + 20;
  }

  /**
   * Add ESG specific content
   */
  private static addESGContent(pdf: jsPDF, section: ReportSection, data: DashboardData, yPosition: number): number {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);

    switch (section.title.toLowerCase()) {
      case 'social impact & stakeholder relations':
        pdf.text('Employee Satisfaction: 88% positive rating on environmental initiatives', 20, yPosition);
        yPosition += 12;
        pdf.text('Community Investment: Environmental education programs funded', 20, yPosition);
        yPosition += 12;
        pdf.text('Supplier Relations: Sustainability criteria in vendor selection', 20, yPosition);
        break;

      case 'governance structure & risk management':
        pdf.text('Board Composition: 30% of directors have environmental expertise', 20, yPosition);
        yPosition += 12;
        pdf.text('Risk Management: Climate risks integrated into enterprise risk framework', 20, yPosition);
        yPosition += 12;
        pdf.text('Executive Compensation: Sustainability metrics linked to incentives', 20, yPosition);
        break;

      case 'regulatory compliance & ethical standards':
        pdf.text('Compliance Status: No material environmental violations', 20, yPosition);
        yPosition += 12;
        pdf.text('Ethical Standards: Environmental ethics training mandatory', 20, yPosition);
        yPosition += 12;
        pdf.text('Transparency: Regular stakeholder reporting and engagement', 20, yPosition);
        break;

      default:
        pdf.text('ESG section content being generated...', 20, yPosition);
    }

    return yPosition + 20;
  }

  /**
   * Add TCFD specific content
   */
  private static addTCFDContent(pdf: jsPDF, section: ReportSection, data: DashboardData, yPosition: number): number {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(this.BRAND_COLORS.text);

    switch (section.title.toLowerCase()) {
      case 'governance: board oversight & management role':
        pdf.text('Board Climate Oversight: Quarterly climate risk reviews conducted', 20, yPosition);
        yPosition += 12;
        pdf.text('Management Integration: Climate considerations in strategic planning', 20, yPosition);
        yPosition += 12;
        pdf.text('Decision-Making: Climate risks inform capital allocation decisions', 20, yPosition);
        break;

      case 'strategy: climate risk & opportunity assessment':
        pdf.text('Physical Risks: Extreme weather impacts assessed for facilities', 20, yPosition);
        yPosition += 12;
        pdf.text('Transition Risks: Carbon pricing and regulation impacts modeled', 20, yPosition);
        yPosition += 12;
        pdf.text('Opportunities: Energy efficiency and renewable energy investments', 20, yPosition);
        break;

      case 'transition plan & climate resilience strategy':
        pdf.text('Net Zero Commitment: Science-based targets set for 2030 and 2050', 20, yPosition);
        yPosition += 12;
        pdf.text('Adaptation Measures: Infrastructure resilience improvements planned', 20, yPosition);
        yPosition += 12;
        pdf.text('Investment Strategy: $500K allocated for climate resilience projects', 20, yPosition);
        break;

      default:
        pdf.text('TCFD framework section content being generated...', 20, yPosition);
    }

    return yPosition + 20;
  }

  /**
   * Create a chart element and convert it to image data URL
   */
  private static async createChartImage(chartConfig: any, width: number = 400, height: number = 300): Promise<string> {
    // Create a temporary container element
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.border = '1px solid #e5e7eb';
    container.style.borderRadius = '8px';
    
    // Create chart title
    const title = document.createElement('h3');
    title.textContent = chartConfig.title || 'Chart';
    title.style.margin = '0 0 16px 0';
    title.style.fontSize = '16px';
    title.style.fontWeight = 'bold';
    title.style.color = '#111827';
    title.style.textAlign = 'center';
    container.appendChild(title);

    // Create a simplified chart representation using canvas
    const canvas = document.createElement('canvas');
    canvas.width = width - 40; // Account for padding
    canvas.height = height - 60; // Account for title and padding
    canvas.style.border = '1px solid #f3f4f6';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw based on chart type
      this.drawChart(ctx, chartConfig, canvas.width, canvas.height);
    }
    
    container.appendChild(canvas);
    document.body.appendChild(container);

    try {
      // Convert to image using html2canvas
      const canvasElement = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      return canvasElement.toDataURL('image/png');
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  /**
   * Draw chart on canvas based on type and data
   */
  private static drawChart(ctx: CanvasRenderingContext2D, chartConfig: any, width: number, height: number): void {
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Set font for labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#374151';

    switch (chartConfig.type) {
      case 'line':
        this.drawLineChart(ctx, chartConfig, padding, padding, chartWidth, chartHeight);
        break;
      case 'area':
        this.drawAreaChart(ctx, chartConfig, padding, padding, chartWidth, chartHeight);
        break;
      case 'bar':
        this.drawBarChart(ctx, chartConfig, padding, padding, chartWidth, chartHeight);
        break;
      case 'pie':
        this.drawPieChart(ctx, chartConfig, padding, padding, chartWidth, chartHeight);
        break;
      default:
        this.drawLineChart(ctx, chartConfig, padding, padding, chartWidth, chartHeight);
    }
  }

  /**
   * Draw line chart
   */
  private static drawLineChart(ctx: CanvasRenderingContext2D, config: any, x: number, y: number, width: number, height: number): void {
    const data = config.data;
    const series = config.series;
    
    if (!data || data.length === 0) return;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height); // X-axis
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height); // Y-axis
    ctx.stroke();

    // Draw data series
    series.forEach((serie: any, seriesIndex: number) => {
      ctx.strokeStyle = serie.color || '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point: any, pointIndex: number) => {
        const xPos = x + (pointIndex / (data.length - 1)) * width;
        const value = point[serie.dataKey] || 0;
        const maxValue = Math.max(...data.map((d: any) => Math.max(...series.map((s: any) => d[s.dataKey] || 0))));
        const yPos = y + height - (value / maxValue) * height;

        if (pointIndex === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = serie.color || '#22c55e';
      data.forEach((point: any, pointIndex: number) => {
        const xPos = x + (pointIndex / (data.length - 1)) * width;
        const value = point[serie.dataKey] || 0;
        const maxValue = Math.max(...data.map((d: any) => Math.max(...series.map((s: any) => d[s.dataKey] || 0))));
        const yPos = y + height - (value / maxValue) * height;
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Draw labels
    ctx.fillStyle = '#6b7280';
    data.forEach((point: any, index: number) => {
      const xPos = x + (index / (data.length - 1)) * width;
      const label = point[config.xAxisKey] || '';
      ctx.fillText(label, xPos - 20, y + height + 20);
    });
  }

  /**
   * Draw area chart (similar to line chart but filled)
   */
  private static drawAreaChart(ctx: CanvasRenderingContext2D, config: any, x: number, y: number, width: number, height: number): void {
    const data = config.data;
    const series = config.series;
    
    if (!data || data.length === 0) return;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();

    // Draw filled areas
    series.forEach((serie: any) => {
      const color = serie.color || '#22c55e';
      ctx.fillStyle = color + '40'; // Add transparency
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      data.forEach((point: any, pointIndex: number) => {
        const xPos = x + (pointIndex / (data.length - 1)) * width;
        const value = point[serie.dataKey] || 0;
        const maxValue = Math.max(...data.map((d: any) => Math.max(...series.map((s: any) => d[s.dataKey] || 0))));
        const yPos = y + height - (value / maxValue) * height;

        if (pointIndex === 0) {
          ctx.moveTo(xPos, y + height);
          ctx.lineTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  /**
   * Draw bar chart
   */
  private static drawBarChart(ctx: CanvasRenderingContext2D, config: any, x: number, y: number, width: number, height: number): void {
    const data = config.data;
    const series = config.series;
    
    if (!data || data.length === 0) return;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();

    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;
    const serieWidth = barWidth / series.length;

    // Find max value for scaling
    const maxValue = Math.max(...data.map((d: any) => Math.max(...series.map((s: any) => d[s.dataKey] || 0))));

    data.forEach((point: any, pointIndex: number) => {
      series.forEach((serie: any, seriesIndex: number) => {
        const value = point[serie.dataKey] || 0;
        const barHeight = (value / maxValue) * height;
        const xPos = x + pointIndex * (barWidth + barSpacing) + seriesIndex * serieWidth;
        const yPos = y + height - barHeight;

        ctx.fillStyle = serie.color || '#22c55e';
        ctx.fillRect(xPos, yPos, serieWidth, barHeight);
      });

      // Draw labels
      ctx.fillStyle = '#6b7280';
      const label = point[config.xAxisKey] || '';
      const labelX = x + pointIndex * (barWidth + barSpacing) + barWidth / 2;
      ctx.fillText(label, labelX - 20, y + height + 20);
    });
  }

  /**
   * Draw pie chart
   */
  private static drawPieChart(ctx: CanvasRenderingContext2D, config: any, x: number, y: number, width: number, height: number): void {
    const data = config.data;
    if (!data || data.length === 0) return;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const total = data.reduce((sum: number, item: any) => sum + (item[config.valueKey] || 0), 0);
    let currentAngle = -Math.PI / 2; // Start at top

    const colors = ['#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

    data.forEach((item: any, index: number) => {
      const value = item[config.valueKey] || 0;
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
      
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      const label = item[config.labelKey] || '';
      ctx.fillText(label, labelX - 20, labelY);

      currentAngle += sliceAngle;
    });
  }

  /**
   * Add chart section to PDF
   */
  private static async addChartSection(
    pdf: jsPDF, 
    dashboardData: DashboardData, 
    section: ReportSection, 
    yPosition: number,
    templateId?: string
  ): Promise<number> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Add section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.text(section.title, 20, yPosition);
    yPosition += 20;

    // Determine chart type based on section title and template
    let chartType = this.determineChartType(section.title, templateId);

    try {
      // Generate chart data
      const chartConfig = this.generateChartData(dashboardData, chartType);
      chartConfig.title = section.title;

      // Create chart image
      const chartImageData = await this.createChartImage(chartConfig, 300, 200);
      
      // Add chart image to PDF
      const imgWidth = 120;
      const imgHeight = 80;
      const imgX = (pageWidth - imgWidth) / 2; // Center the image
      
      pdf.addImage(chartImageData, 'PNG', imgX, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 20;

    } catch (error) {
      console.error('Error generating chart:', error);
      
      // Add error message instead of chart
      pdf.setFontSize(10);
      pdf.setTextColor('#ef4444');
      pdf.text('Chart generation failed - data may be incomplete', 20, yPosition);
      yPosition += 20;
    }

    return yPosition;
  }

  /**
   * Determine chart type based on section title and template
   */
  private static determineChartType(sectionTitle: string, templateId?: string): string {
    const titleLower = sectionTitle.toLowerCase();
    
    // Template-specific chart mappings
    if (templateId) {
      switch (templateId) {
        case 'iso-14001-ems':
          if (titleLower.includes('aspects') || titleLower.includes('impacts')) return 'environmental-aspects';
          if (titleLower.includes('objectives') || titleLower.includes('targets')) return 'environmental-objectives';
          break;
        
        case 'cdp-disclosure':
          if (titleLower.includes('targets') || titleLower.includes('reduction') || titleLower.includes('performance')) return 'emissions-targets';
          if (titleLower.includes('ghg') || titleLower.includes('emissions') || titleLower.includes('scope')) return 'ghg-emissions';
          break;
        
        case 'gri-sustainability':
          if (titleLower.includes('economic')) return 'economic-performance';
          if (titleLower.includes('environmental')) return 'environmental-performance';
          break;
        
        case 'esg-investment':
          if (titleLower.includes('esg') || titleLower.includes('score')) return 'esg-scores';
          if (titleLower.includes('risk')) return 'risk-assessment';
          break;
        
        case 'tcfd-disclosure':
          if (titleLower.includes('scenario') || titleLower.includes('analysis')) return 'scenario-analysis';
          if (titleLower.includes('risk')) return 'risk-assessment';
          break;
      }
    }

    // Default chart type detection
    if (titleLower.includes('carbon') || titleLower.includes('emission')) {
      return titleLower.includes('breakdown') ? 'carbon-breakdown' : 'carbon-trend';
    } else if (titleLower.includes('progress') || titleLower.includes('goal')) {
      return 'goals-progress';
    } else if (titleLower.includes('energy')) {
      return 'energy-usage';
    }
    
    return 'energy-usage'; // Default fallback
  }

  /**
   * Add section header to PDF
   */
  private static addSectionHeader(pdf: jsPDF, section: ReportSection, yPosition: number): number {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(this.BRAND_COLORS.primary);
    pdf.text(section.title, 20, yPosition);
    yPosition += 25;

    return yPosition;
  }

  /**
   * Add generic section to PDF
   */
  private static addGenericSection(pdf: jsPDF, section: ReportSection, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(this.BRAND_COLORS.text);
    pdf.text(section.title, 20, yPosition);
    yPosition += 20;

    // Add placeholder content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#6b7280');
    pdf.text('Content for this section is being processed...', 20, yPosition);
    yPosition += 15;

    return yPosition;
  }

  static getReportTemplates(): ReportTemplate[] {
    return [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'High-level overview for leadership',
        sections: [
          { type: 'header', title: 'Executive Summary' },
          { type: 'summary', title: 'Key Metrics' },
          { type: 'chart', title: 'Performance Overview' },
          { type: 'recommendations', title: 'Priority Actions' }
        ],
        branding: {
          primaryColor: this.BRAND_COLORS.primary,
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.accent
        }
      },
      {
        id: 'technical-deep-dive',
        name: 'Technical Deep Dive',
        description: 'Detailed analysis for engineers',
        sections: [
          { type: 'header', title: 'Technical Analysis' },
          { type: 'table', title: 'Detailed Energy Data' },
          { type: 'chart', title: 'Consumption Trends' },
          { type: 'recommendations', title: 'Technical Recommendations' }
        ],
        branding: {
          primaryColor: this.BRAND_COLORS.accent,
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.primary
        }
      },
      {
        id: 'regulatory-compliance',
        name: 'Regulatory Compliance',
        description: 'Reports for regulatory bodies',
        sections: [
          { type: 'header', title: 'Compliance Report' },
          { type: 'summary', title: 'Compliance Status' },
          { type: 'table', title: 'Regulatory Metrics' },
          { type: 'text', title: 'Certification Details' }
        ],
        branding: {
          primaryColor: this.BRAND_COLORS.secondary,
          secondaryColor: this.BRAND_COLORS.primary,
          accentColor: this.BRAND_COLORS.success
        }
      },
      {
        id: 'investor-relations',
        name: 'Investor Relations',
        description: 'ESG metrics for investors',
        sections: [
          { type: 'header', title: 'ESG Performance Report' },
          { type: 'summary', title: 'ESG Metrics' },
          { type: 'chart', title: 'Performance Trends' },
          { type: 'text', title: 'Investment Impact' }
        ],
        branding: {
          primaryColor: this.BRAND_COLORS.accent,
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.success
        }
      },
      {
        id: 'sustainability-overview',
        name: 'Sustainability Overview',
        description: 'Comprehensive sustainability report',
        sections: [
          { type: 'header', title: 'Sustainability Performance' },
          { type: 'summary', title: 'Key Sustainability Metrics' },
          { type: 'chart', title: 'Progress Visualization' },
          { type: 'table', title: 'Energy Usage' },
          { type: 'recommendations', title: 'Improvement Actions' }
        ],
        branding: {
          primaryColor: this.BRAND_COLORS.primary,
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.accent
        }
      },
      // ISO 14001 Environmental Management System Template
      {
        id: 'iso-14001-ems',
        name: 'ISO 14001 EMS Report',
        description: 'Environmental Management System compliance report following ISO 14001:2015 standard',
        sections: [
          { type: 'header', title: 'ISO 14001 Environmental Management System Report' },
          { type: 'text', title: 'Environmental Policy Statement' },
          { type: 'summary', title: 'Environmental Performance Metrics' },
          { type: 'chart', title: 'Environmental Aspects & Impacts Analysis' },
          { type: 'table', title: 'Legal & Regulatory Compliance Status' },
          { type: 'chart', title: 'Environmental Objectives & Targets Progress' },
          { type: 'text', title: 'Operational Controls & Emergency Preparedness' },
          { type: 'table', title: 'Internal Audit Findings & Corrective Actions' },
          { type: 'text', title: 'Management Review & Continual Improvement' },
          { type: 'recommendations', title: 'Environmental Improvement Opportunities' }
        ],
        branding: {
          primaryColor: '#2E7D32', // ISO green
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.primary
        }
      },
      // CDP Carbon Disclosure Project Template
      {
        id: 'cdp-disclosure',
        name: 'CDP Climate Change Report',
        description: 'Carbon Disclosure Project questionnaire response format',
        sections: [
          { type: 'header', title: 'CDP Climate Change Disclosure' },
          { type: 'text', title: 'Governance: Climate-Related Oversight & Accountability' },
          { type: 'summary', title: 'Climate Risk & Opportunity Assessment' },
          { type: 'chart', title: 'GHG Emissions Inventory (Scope 1, 2, 3)' },
          { type: 'table', title: 'Energy Consumption & Renewable Energy Usage' },
          { type: 'chart', title: 'Emissions Reduction Targets & Performance' },
          { type: 'text', title: 'Climate-Related Financial Disclosures' },
          { type: 'table', title: 'Supply Chain Engagement on Climate Issues' },
          { type: 'recommendations', title: 'Climate Action Plan & Next Steps' }
        ],
        branding: {
          primaryColor: '#1565C0', // CDP blue
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.accent
        }
      },
      // GRI Global Reporting Initiative Template
      {
        id: 'gri-sustainability',
        name: 'GRI Standards Sustainability Report',
        description: 'Comprehensive sustainability report following GRI Universal Standards',
        sections: [
          { type: 'header', title: 'GRI Standards Sustainability Report' },
          { type: 'text', title: 'Organizational Profile & Reporting Practices' },
          { type: 'summary', title: 'Material Topics & Stakeholder Engagement' },
          { type: 'chart', title: 'Economic Performance Indicators' },
          { type: 'chart', title: 'Environmental Performance Indicators' },
          { type: 'table', title: 'Energy & Emissions Management' },
          { type: 'text', title: 'Social Performance & Community Impact' },
          { type: 'table', title: 'Governance, Ethics & Compliance' },
          { type: 'recommendations', title: 'Sustainability Goals & Future Commitments' }
        ],
        branding: {
          primaryColor: '#FF6B35', // GRI orange
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.primary
        }
      },
      // ESG Investment-Grade Template
      {
        id: 'esg-investment',
        name: 'ESG Investment Report',
        description: 'Environmental, Social, and Governance metrics for investors and rating agencies',
        sections: [
          { type: 'header', title: 'ESG Performance & Investment Readiness Report' },
          { type: 'summary', title: 'ESG Score Overview & Key Performance Indicators' },
          { type: 'chart', title: 'Environmental Impact & Resource Efficiency' },
          { type: 'chart', title: 'Carbon Footprint & Climate Risk Assessment' },
          { type: 'table', title: 'Social Impact & Stakeholder Relations' },
          { type: 'text', title: 'Governance Structure & Risk Management' },
          { type: 'table', title: 'Regulatory Compliance & Ethical Standards' },
          { type: 'chart', title: 'ESG Performance Trends & Benchmarking' },
          { type: 'recommendations', title: 'ESG Enhancement Strategy & Investment Case' }
        ],
        branding: {
          primaryColor: '#6A1B9A', // ESG purple
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.success
        }
      },
      // TCFD Task Force on Climate-related Financial Disclosures Template
      {
        id: 'tcfd-disclosure',
        name: 'TCFD Climate Risk Report',
        description: 'Task Force on Climate-related Financial Disclosures framework',
        sections: [
          { type: 'header', title: 'TCFD Climate-Related Financial Disclosures' },
          { type: 'text', title: 'Governance: Board Oversight & Management Role' },
          { type: 'summary', title: 'Strategy: Climate Risk & Opportunity Assessment' },
          { type: 'chart', title: 'Risk Management: Climate Risk Integration' },
          { type: 'table', title: 'Metrics & Targets: Climate Performance Indicators' },
          { type: 'chart', title: 'Scenario Analysis & Financial Impact Assessment' },
          { type: 'text', title: 'Transition Plan & Climate Resilience Strategy' },
          { type: 'recommendations', title: 'Climate Action Roadmap & Future Commitments' }
        ],
        branding: {
          primaryColor: '#00695C', // TCFD teal
          secondaryColor: this.BRAND_COLORS.secondary,
          accentColor: this.BRAND_COLORS.accent
        }
      }
    ];
  }
}

export const generateMonthlyReport = async (dashboardData: DashboardData): Promise<Blob> => {
  const templates = ReportGenerator.getReportTemplates();
  const sustainabilityTemplate = templates.find(t => t.id === 'sustainability-overview') || templates[4];
  
  const reportData: ReportData = {
    title: 'Monthly Sustainability Report',
    generatedDate: new Date().toLocaleDateString(),
    reportPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dashboardData,
    template: sustainabilityTemplate
  };

  return ReportGenerator.generatePDF(reportData);
};

export const generateCustomReport = async (
  dashboardData: DashboardData,
  template: ReportTemplate,
  customTitle?: string
): Promise<Blob> => {
  const reportData: ReportData = {
    title: customTitle || template.name,
    generatedDate: new Date().toLocaleDateString(),
    reportPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dashboardData,
    template
  };

  return ReportGenerator.generatePDF(reportData);
}; 