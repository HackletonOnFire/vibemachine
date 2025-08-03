'use client';

import { useState } from 'react';
import { Layout } from '../../../../components/Layout';
import { Card, CardHeader, CardContent } from '../../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { Spinner } from '../../../../components/ui/LoadingSpinner';
import { useReports } from '../../../hooks/useReports';
import { ReportGenerationModal } from '../../../components/reports';

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'generate' | 'schedule' | 'share' | null>(null);

  const {
    reports,
    templates,
    isGenerating,
    error,
    generateReport,
    downloadReport,
    previewReport,
    deleteReport,
    scheduleReport
  } = useReports(user?.id);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAction = (action: 'generate' | 'schedule' | 'share') => {
    setSelectedAction(action);
    if (action === 'generate') {
      setIsModalOpen(true);
    } else if (action === 'schedule') {
      // For now, just generate a monthly report and schedule it
      scheduleReport('monthly-sustainability', 'monthly');
      alert('Report scheduled successfully! You will receive monthly sustainability reports.');
    } else if (action === 'share') {
      alert('Share functionality will be available in the next update. For now, you can download reports and share them manually.');
    }
  };

  return (
    <Layout currentPage="/dashboard/reports" userId={user.id}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sustainability Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate, download, and share comprehensive sustainability reports for stakeholders.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('generate')}
            disabled={isGenerating}
            className="p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center group"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-700">
              {isGenerating ? (
                <Spinner size="sm" />
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {isGenerating ? 'Generating...' : 'Generate New Report'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Create custom report</div>
          </button>

          <button 
            onClick={() => handleQuickAction('schedule')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-700">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900">Schedule Reports</div>
            <div className="text-xs text-gray-500 mt-1">Automate generation</div>
          </button>

          <button 
            onClick={() => handleQuickAction('share')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-700">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900">Share Reports</div>
            <div className="text-xs text-gray-500 mt-1">Send to stakeholders</div>
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
          
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
              <p className="text-gray-600 mb-4">Generate your first sustainability report to get started.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Generate Report
              </button>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 mb-4">{report.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Last Generated:</span> {report.lastGenerated}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {report.type}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {report.size}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status === 'ready' ? 'Ready' : report.status === 'generating' ? 'Generating...' : 'Failed'}
                      </span>
                      
                      {report.status === 'ready' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => previewReport(report.id)}
                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            Preview
                          </button>
                          <button 
                            onClick={() => downloadReport(report.id)}
                            className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            Download
                          </button>
                          <button 
                            onClick={() => deleteReport(report.id)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      
                      {report.status === 'failed' && report.templateId && (
                        <button
                          onClick={() => generateReport(report.templateId!, report.title)}
                          className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Report Templates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Report Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-primary-300">
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="space-y-1 mb-3">
                  {template.sections.slice(0, 3).map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                      <span className="text-xs text-gray-500">{section.title}</span>
                    </div>
                  ))}
                  {template.sections.length > 3 && (
                    <div className="text-xs text-gray-400 ml-4">
                      +{template.sections.length - 3} more sections
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => generateReport(template.id)}
                  disabled={isGenerating}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Use Template →'}
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance Info */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-green-900">Compliance Ready</h3>
              <p className="text-sm text-green-700 mt-1">
                All reports are generated according to GRI Standards, SASB Guidelines, and TCFD recommendations.
                Reports include audit trails and meet regulatory requirements for ESG disclosure.
              </p>
            </div>
          </div>
        </Card>

        {/* Report Generation Modal */}
        <ReportGenerationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          templates={templates}
          onGenerate={generateReport}
          isGenerating={isGenerating}
        />
      </div>
    </Layout>
  );
} 