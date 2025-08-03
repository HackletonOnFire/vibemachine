'use client';

import { useState } from 'react';
import { Card, CardContent, Spinner } from '../ui';
import { ReportTemplate } from '../../lib/utils/reportGenerator';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ReportTemplate[];
  onGenerate: (templateId: string, customTitle?: string) => Promise<void>;
  isGenerating: boolean;
}

export function ReportGenerationModal({
  isOpen,
  onClose,
  templates,
  onGenerate,
  isGenerating
}: ReportGenerationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [step, setStep] = useState<'select' | 'customize'>('select');

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('customize');
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    await onGenerate(selectedTemplate, customTitle || undefined);
    setStep('select');
    setSelectedTemplate('');
    setCustomTitle('');
    onClose();
  };

  const handleBack = () => {
    setStep('select');
    setSelectedTemplate('');
    setCustomTitle('');
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'select' ? 'Generate New Report' : 'Customize Report'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isGenerating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div>
              <p className="text-gray-600 mb-6">
                Choose a report template to generate your sustainability report:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates?.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary-300"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          Includes:
                        </h4>
                        <div className="space-y-1">
                          {template.sections.map((section, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                              <span className="text-xs text-gray-600">{section.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-right">
                        <span className="text-sm text-primary-600 font-medium">
                          Select Template →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 'customize' && selectedTemplateData && (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isGenerating}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Templates
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedTemplateData.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplateData.description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Title (Optional)
                  </label>
                  <input
                    id="customTitle"
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={selectedTemplateData.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use the default template name
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Report Sections:</h4>
                  <div className="space-y-2">
                    {selectedTemplateData.sections.map((section, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{section.title}</span>
                          <span className="ml-2 text-xs text-gray-500 capitalize">({section.type})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Report Generation</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        The report will be generated using your current dashboard data including energy usage, 
                        carbon footprint metrics, sustainability goals, and AI recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            
            {step === 'customize' && (
              <button
                onClick={handleGenerate}
                disabled={!selectedTemplate || isGenerating}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isGenerating && <Spinner size="sm" />}
                <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 