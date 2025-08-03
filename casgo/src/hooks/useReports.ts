import { useState, useCallback, useEffect } from 'react';
import { useDashboardData } from './useDashboardData';
import { 
  ReportGenerator, 
  ReportTemplate, 
  generateMonthlyReport, 
  generateCustomReport 
} from '../lib/utils/reportGenerator';

export interface GeneratedReport {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
  type: 'PDF' | 'Excel';
  size: string;
  status: 'ready' | 'generating' | 'failed';
  blob?: Blob;
  templateId?: string;
}

export interface UseReportsReturn {
  reports: GeneratedReport[];
  templates: ReportTemplate[];
  isGenerating: boolean;
  error: string | null;
  generateReport: (templateId: string, customTitle?: string) => Promise<void>;
  downloadReport: (reportId: string) => void;
  previewReport: (reportId: string) => void;
  deleteReport: (reportId: string) => void;
  scheduleReport: (templateId: string, frequency: 'weekly' | 'monthly' | 'quarterly') => void;
}

// Enhanced mock dashboard data with comprehensive recommendations
const getMockDashboardDataWithRecommendations = () => ({
  user: {
    name: 'Sarah Johnson',
    businessName: 'EcoTech Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  energyData: {
    currentMonth: { electricity: 15420, gas: 2850, totalCost: 3240 },
    previousMonth: { electricity: 16100, gas: 3200, totalCost: 3580 },
    yearToDate: { electricity: 142500, gas: 28400, totalCost: 31200 }
  },
  carbonFootprint: {
    currentEmissions: 18.5,
    baseline: 22.3,
    reduction: 17,
    monthlyTrend: [
      { month: 'Jan', emissions: 22.1 },
      { month: 'Feb', emissions: 21.8 },
      { month: 'Mar', emissions: 20.5 },
      { month: 'Apr', emissions: 19.2 },
      { month: 'May', emissions: 18.5 },
      { month: 'Jun', emissions: 17.7 },
    ]
  },
  goals: {
    targetReduction: 30,
    deadline: '2025-12-31',
    progress: 56,
    milestones: [
      { title: 'LED Lighting Upgrade', completed: true, dueDate: '2024-03-31' },
      { title: 'HVAC Optimization', completed: false, dueDate: '2024-06-30' },
      { title: 'Smart Building Systems', completed: false, dueDate: '2024-09-30' }
    ]
  },
  recommendations: [
    { 
      priority: 'high' as const, 
      title: 'Install Smart Thermostats', 
      description: 'Upgrade to programmable smart thermostats to optimize heating and cooling schedules based on occupancy patterns and reduce energy waste during non-business hours.',
      potentialSavings: 2400, 
      co2Reduction: 3.2, 
      implementationCost: 1200, 
      paybackPeriod: 6 
    },
    { 
      priority: 'high' as const, 
      title: 'Switch to Renewable Energy Provider', 
      description: 'Transition to a green energy provider or install solar panels to reduce scope 2 emissions and achieve carbon neutrality goals faster.',
      potentialSavings: 1800, 
      co2Reduction: 8.5, 
      implementationCost: 0, 
      paybackPeriod: 0 
    },
    { 
      priority: 'medium' as const, 
      title: 'Implement LED Lighting Retrofit', 
      description: 'Replace existing fluorescent and incandescent lighting with energy-efficient LED bulbs throughout the facility to reduce electricity consumption.',
      potentialSavings: 960, 
      co2Reduction: 1.8, 
      implementationCost: 3200, 
      paybackPeriod: 40 
    },
    { 
      priority: 'medium' as const, 
      title: 'Optimize HVAC System', 
      description: 'Regular maintenance and system optimization including filter changes, duct sealing, and temperature set-point adjustments.',
      potentialSavings: 1440, 
      co2Reduction: 2.1, 
      implementationCost: 800, 
      paybackPeriod: 7 
    },
    { 
      priority: 'low' as const, 
      title: 'Install Motion Sensor Lighting', 
      description: 'Add motion sensors to common areas, bathrooms, and storage rooms to automatically control lighting based on occupancy.',
      potentialSavings: 480, 
      co2Reduction: 0.9, 
      implementationCost: 600, 
      paybackPeriod: 15 
    }
  ],
  lastUpdated: new Date().toISOString()
});

export function useReports(userId?: string): UseReportsReturn {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData(userId);
  
  const templates = ReportGenerator.getReportTemplates();

  // Load existing reports from localStorage on mount
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem(`reports-${userId}`);
      if (savedReports) {
        try {
          const parsedReports = JSON.parse(savedReports);
          setReports(parsedReports);
          return; // Early return if successful
        } catch (error) {
          console.error('Failed to parse saved reports:', error);
        }
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    
    // Load initial mock reports if no saved reports or localStorage failed
    setReports([
        {
          id: '1',
          title: 'Monthly Sustainability Report',
          description: 'Comprehensive monthly overview of energy usage, emissions, and goal progress',
          lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'PDF',
          size: '2.3 MB',
          status: 'ready',
          templateId: 'monthly-sustainability'
        },
        {
          id: '2',
          title: 'Annual ESG Report',
          description: 'Year-end Environmental, Social, and Governance performance report',
          lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'PDF',
          size: '8.7 MB',
          status: 'ready',
          templateId: 'investor-relations'
        },
        {
          id: '3',
          title: 'Carbon Footprint Analysis',
          description: 'Detailed analysis of scope 1, 2, and 3 emissions with reduction strategies',
          lastGenerated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          type: 'Excel',
          size: '1.8 MB',
          status: 'ready',
          templateId: 'technical-deep-dive'
        },
        {
          id: '4',
          title: 'Energy Efficiency Audit',
          description: 'Quarterly energy efficiency assessment with benchmarking data',
          lastGenerated: 'In Progress',
          type: 'PDF',
          size: '-',
          status: 'generating',
          templateId: 'executive-summary'
        }
      ]);
  }, [userId]);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    if (userId && reports.length > 0) {
      try {
        // Don't save the blob data to localStorage (too large)
        const reportsToSave = reports.map(({ blob, ...rest }) => rest);
        localStorage.setItem(`reports-${userId}`, JSON.stringify(reportsToSave));
      } catch (error) {
        console.error('Failed to save reports to localStorage:', error);
        // Don't throw the error - this is not critical functionality
      }
    }
  }, [reports, userId]);

  const generateReport = useCallback(async (templateId: string, customTitle?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Use real dashboard data if available, otherwise use enhanced mock data
      let reportData = dashboardData;
      
      if (!reportData) {
        console.log('Using mock dashboard data for report generation');
        reportData = getMockDashboardDataWithRecommendations();
      }

      // Ensure recommendations exist
      if (!reportData.recommendations || reportData.recommendations.length === 0) {
        console.log('No recommendations found, adding mock recommendations');
        reportData = {
          ...reportData,
          recommendations: getMockDashboardDataWithRecommendations().recommendations
        };
      }

      console.log('Generating report with data:', {
        recommendationsCount: reportData.recommendations?.length || 0,
        hasUser: !!reportData.user,
        hasEnergyData: !!reportData.energyData
      });

      let blob: Blob;
      if (templateId === 'monthly-sustainability') {
        blob = await generateMonthlyReport(reportData);
      } else {
        blob = await generateCustomReport(reportData, template, customTitle);
      }

      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        title: customTitle || template.name,
        description: template.description,
        lastGenerated: new Date().toLocaleDateString(),
        type: 'PDF',
        size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'ready',
        blob,
        templateId
      };

      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      console.error('Report generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [dashboardData, templates]);

  const downloadReport = useCallback((reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      setError('Report not found');
      return;
    }

    if (report.status !== 'ready') {
      setError('Report is not ready for download');
      return;
    }

    // If we have the blob, download it directly
    if (report.blob) {
      const url = URL.createObjectURL(report.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // If it's an existing report without blob, regenerate it
    if (report.templateId) {
      generateReport(report.templateId, report.title);
    } else {
      setError('Unable to download report. Please regenerate it.');
    }
  }, [reports, generateReport]);

  const previewReport = useCallback((reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      setError('Report not found');
      return;
    }

    if (report.status !== 'ready') {
      setError('Report is not ready for preview');
      return;
    }

    if (report.blob) {
      const url = URL.createObjectURL(report.blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      setError('Report preview not available. Please regenerate the report.');
    }
  }, [reports]);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const scheduleReport = useCallback((templateId: string, frequency: 'weekly' | 'monthly' | 'quarterly') => {
    // This would integrate with a scheduling service in a real application
    console.log(`Scheduling report ${templateId} with frequency ${frequency}`);
    // For now, just show a success message
    setError(null);
    // You could add a toast notification here
  }, []);

  return {
    reports,
    templates,
    isGenerating,
    error: error || dashboardError,
    generateReport,
    downloadReport,
    previewReport,
    deleteReport,
    scheduleReport
  };
} 