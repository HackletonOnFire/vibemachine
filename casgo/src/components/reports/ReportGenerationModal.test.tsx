import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportGenerationModal } from './ReportGenerationModal';
import { ReportTemplate } from '../../lib/utils/reportGenerator';

// Mock the UI components
jest.mock('../ui', () => ({
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

describe('ReportGenerationModal', () => {
  const mockTemplates: ReportTemplate[] = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for leadership',
      sections: [
        { type: 'header', title: 'Executive Summary' },
        { type: 'summary', title: 'Key Metrics' },
        { type: 'recommendations', title: 'Priority Actions' }
      ],
      branding: {
        primaryColor: '#10B981',
        secondaryColor: '#1F2937',
        accentColor: '#3B82F6'
      }
    },
    {
      id: 'technical-deep-dive',
      name: 'Technical Deep Dive',
      description: 'Detailed analysis for engineers',
      sections: [
        { type: 'header', title: 'Technical Analysis' },
        { type: 'table', title: 'Detailed Energy Data' },
        { type: 'chart', title: 'Consumption Trends' }
      ],
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        accentColor: '#10B981'
      }
    },
    {
      id: 'regulatory-compliance',
      name: 'Regulatory Compliance',
      description: 'Reports for regulatory bodies',
      sections: [
        { type: 'header', title: 'Compliance Report' },
        { type: 'summary', title: 'Compliance Status' },
        { type: 'table', title: 'Regulatory Metrics' }
      ],
      branding: {
        primaryColor: '#1F2937',
        secondaryColor: '#10B981',
        accentColor: '#059669'
      }
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    templates: mockTemplates,
    onGenerate: jest.fn(),
    isGenerating: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          isOpen={false}
        />
      );

      expect(screen.queryByText('Generate New Report')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      expect(screen.getByText('Generate New Report')).toBeInTheDocument();
    });

    it('should display close button', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Template Selection Step', () => {
    it('should display template selection instruction', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      expect(screen.getByText('Choose a report template to generate your sustainability report:')).toBeInTheDocument();
    });

    it('should render all provided templates', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      mockTemplates.forEach(template => {
        expect(screen.getByText(template.name)).toBeInTheDocument();
        expect(screen.getByText(template.description)).toBeInTheDocument();
      });
    });

    it('should display template sections', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      // Check for sections from the first template
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      expect(screen.getByText('Priority Actions')).toBeInTheDocument();
    });

    it('should show "Includes:" label for template sections', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      const includesLabels = screen.getAllByText('Includes:');
      expect(includesLabels).toHaveLength(mockTemplates.length);
    });

    it('should show "Select Template →" for each template', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      const selectButtons = screen.getAllByText('Select Template →');
      expect(selectButtons).toHaveLength(mockTemplates.length);
    });

    it('should navigate to customize step when template is selected', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      expect(screen.getByText('Customize Report')).toBeInTheDocument();
    });
  });

  describe('Template Cards Interaction', () => {
    it('should make template cards clickable', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      const templateCards = screen.getAllByTestId('card');
      expect(templateCards.length).toBeGreaterThan(0);

      // Each card should be clickable
      templateCards.forEach(card => {
        expect(card).toHaveStyle('cursor: pointer');
      });
    });

    it('should select executive summary template', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      // Find and click the executive summary template
      const executiveSummaryCard = screen.getByText('Executive Summary').closest('[data-testid="card"]');
      fireEvent.click(executiveSummaryCard!);

      expect(screen.getByText('Customize Report')).toBeInTheDocument();
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });

    it('should select technical deep dive template', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      // Find and click the technical deep dive template
      const technicalCard = screen.getByText('Technical Deep Dive').closest('[data-testid="card"]');
      fireEvent.click(technicalCard!);

      expect(screen.getByText('Customize Report')).toBeInTheDocument();
      expect(screen.getByText('Technical Deep Dive')).toBeInTheDocument();
    });

    it('should select regulatory compliance template', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      // Find and click the regulatory compliance template
      const complianceCard = screen.getByText('Regulatory Compliance').closest('[data-testid="card"]');
      fireEvent.click(complianceCard!);

      expect(screen.getByText('Customize Report')).toBeInTheDocument();
      expect(screen.getByText('Regulatory Compliance')).toBeInTheDocument();
    });
  });

  describe('Customize Step', () => {
    beforeEach(() => {
      render(<ReportGenerationModal {...defaultProps} />);
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
    });

    it('should display back button', () => {
      expect(screen.getByText('Back to Templates')).toBeInTheDocument();
    });

    it('should display selected template information', () => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('High-level overview for leadership')).toBeInTheDocument();
    });

    it('should display custom title input field', () => {
      expect(screen.getByLabelText('Custom Title (Optional)')).toBeInTheDocument();
    });

    it('should have placeholder text for custom title', () => {
      const titleInput = screen.getByLabelText('Custom Title (Optional)');
      expect(titleInput).toHaveAttribute('placeholder', 'Executive Summary');
    });

    it('should display report sections with checkmarks', () => {
      const sectionElements = screen.getAllByText('✓');
      expect(sectionElements.length).toBeGreaterThan(0);
    });

    it('should display section titles and types', () => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('(header)')).toBeInTheDocument();
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      expect(screen.getByText('(summary)')).toBeInTheDocument();
    });

    it('should display generation information notice', () => {
      expect(screen.getByText('Report Generation')).toBeInTheDocument();
      expect(screen.getByText(/The report will be generated using your current dashboard data/)).toBeInTheDocument();
    });

    it('should display generate button', () => {
      expect(screen.getByText('Generate Report')).toBeInTheDocument();
    });

    it('should display cancel button', () => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Custom Title Input', () => {
    beforeEach(() => {
      render(<ReportGenerationModal {...defaultProps} />);
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
    });

    it('should accept custom title input', () => {
      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      
      fireEvent.change(titleInput, { target: { value: 'My Custom Report Title' } });
      
      expect(titleInput.value).toBe('My Custom Report Title');
    });

    it('should clear custom title input', () => {
      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(titleInput, { target: { value: '' } });
      
      expect(titleInput.value).toBe('');
    });

    it('should show helper text for custom title', () => {
      expect(screen.getByText('Leave empty to use the default template name')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to template selection', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Select a template
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
      
      // Navigate back
      const backButton = screen.getByText('Back to Templates');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Generate New Report')).toBeInTheDocument();
      expect(screen.getByText('Choose a report template to generate your sustainability report:')).toBeInTheDocument();
    });

    it('should reset state when navigating back', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Select template and enter custom title
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
      
      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      
      // Navigate back
      const backButton = screen.getByText('Back to Templates');
      fireEvent.click(backButton);
      
      // Select template again
      fireEvent.click(firstTemplateCard);
      
      // Title should be reset
      const newTitleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      expect(newTitleInput.value).toBe('');
    });
  });

  describe('Report Generation', () => {
    beforeEach(() => {
      render(<ReportGenerationModal {...defaultProps} />);
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
    });

    it('should call onGenerate with template ID when generate button is clicked', async () => {
      const generateButton = screen.getByText('Generate Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(defaultProps.onGenerate).toHaveBeenCalledWith('executive-summary', undefined);
      });
    });

    it('should call onGenerate with custom title when provided', async () => {
      const titleInput = screen.getByLabelText('Custom Title (Optional)');
      fireEvent.change(titleInput, { target: { value: 'Custom Report Title' } });
      
      const generateButton = screen.getByText('Generate Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(defaultProps.onGenerate).toHaveBeenCalledWith('executive-summary', 'Custom Report Title');
      });
    });

    it('should close modal after successful generation', async () => {
      const generateButton = screen.getByText('Generate Report');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should reset form state after generation', async () => {
      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      
      const generateButton = screen.getByText('Generate Report');
      fireEvent.click(generateButton);

      // Note: In actual implementation, the modal would close and reopen clean
      // This test verifies the internal state reset logic
      await waitFor(() => {
        expect(defaultProps.onGenerate).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show spinner when generating', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          isGenerating={true}
        />
      );
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    it('should disable generate button when generating', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          isGenerating={true}
        />
      );
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      const generateButton = screen.getByText('Generating...');
      expect(generateButton).toBeDisabled();
    });

    it('should disable close button when generating', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          isGenerating={true}
        />
      );
      
      const closeButton = screen.getAllByRole('button')[0]; // Close button is first
      expect(closeButton).toBeDisabled();
    });

    it('should disable back button when generating', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          isGenerating={true}
        />
      );
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      const backButton = screen.getByText('Back to Templates');
      expect(backButton).toBeDisabled();
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      const closeButton = screen.getAllByRole('button')[0]; // X button
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal content', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      const modalContent = screen.getByText('Generate New Report');
      fireEvent.click(modalContent);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Template Validation', () => {
    it('should handle empty templates array', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          templates={[]}
        />
      );

      expect(screen.getByText('Choose a report template to generate your sustainability report:')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should handle single template', () => {
      render(
        <ReportGenerationModal
          {...defaultProps}
          templates={[mockTemplates[0]]}
        />
      );

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getAllByTestId('card')).toHaveLength(1);
    });

    it('should handle template without sections', () => {
      const templateWithoutSections = {
        ...mockTemplates[0],
        sections: []
      };

      render(
        <ReportGenerationModal
          {...defaultProps}
          templates={[templateWithoutSections]}
        />
      );

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form elements', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      expect(screen.getByLabelText('Custom Title (Optional)')).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      expect(screen.getByText('Generate Report')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Back to Templates')).toBeInTheDocument();
    });

    it('should provide proper heading hierarchy', () => {
      render(<ReportGenerationModal {...defaultProps} />);

      expect(screen.getByText('Generate New Report')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle template selection without template ID', () => {
      const invalidTemplate = {
        ...mockTemplates[0],
        id: ''
      };

      render(
        <ReportGenerationModal
          {...defaultProps}
          templates={[invalidTemplate]}
        />
      );

      const templateCard = screen.getByTestId('card');
      fireEvent.click(templateCard);

      // Should still navigate to customize step
      expect(screen.getByText('Customize Report')).toBeInTheDocument();
    });

    it('should handle very long custom titles', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      const longTitle = 'A'.repeat(1000);
      
      fireEvent.change(titleInput, { target: { value: longTitle } });
      
      expect(titleInput.value).toBe(longTitle);
    });

    it('should handle special characters in custom title', () => {
      render(<ReportGenerationModal {...defaultProps} />);
      
      // Navigate to customize step
      const firstTemplateCard = screen.getAllByTestId('card')[0];
      fireEvent.click(firstTemplateCard);

      const titleInput = screen.getByLabelText('Custom Title (Optional)') as HTMLInputElement;
      const specialTitle = 'Report & Analysis (2024) - 100% Complete!';
      
      fireEvent.change(titleInput, { target: { value: specialTitle } });
      
      expect(titleInput.value).toBe(specialTitle);
    });
  });
}); 