import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

// Mock the components that have complex dependencies
jest.mock('../../components/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  ButtonGroup: ({ children }: any) => <div>{children}</div>,
  Input: ({ label, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
    </div>
  ),
  Textarea: ({ label, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <textarea {...props} />
    </div>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ title, subtitle, children, ...props }: any) => (
    <div {...props}>
      {children || (
        <>
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </>
      )}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardGrid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Chart: ({ title, subtitle, children, ...props }: any) => (
    <div {...props}>
      {title && <h4>{title}</h4>}
      {subtitle && <h5>{subtitle}</h5>}
      {children}
    </div>
  ),
  SustainabilityChartPresets: {
    energyUsage: {
      series: [],
    },
    goalProgress: {
      series: [],
    },
  },
  Spinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  CircularSpinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  PulseDotsSpinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  BouncingBallsSpinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  WaveSpinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  SustainabilitySpinner: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  LoadingOverlay: ({ children, ...props }: any) => <div {...props}>{children || 'Loading...'}</div>,
  ProgressBar: ({ value, ...props }: any) => <div {...props}>Progress: {value || 0}%</div>,
  Skeleton: ({ children, ...props }: any) => <div {...props}>{children || 'Loading skeleton...'}</div>,
  microInteractions: {
    hoverScale: 'hover:scale-105 transition-transform duration-200',
    hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    press: 'active:scale-95 transition-transform duration-100',
    glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-300',
    fadeIn: 'opacity-0 animate-pulse duration-500',
    slideInBottom: 'transform translate-y-2 transition-all duration-500 ease-out',
    slideInRight: 'transform translate-x-2 transition-all duration-500 ease-out',
    bounceIn: 'transform scale-95 transition-all duration-300 ease-out',
  },
}));

describe('Home', () => {
    it('renders the EcoMind Sustainability heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /ecomind sustainability/i })

    expect(heading).toBeInTheDocument()
  })

  it('renders the get started button', () => {
    render(<Home />)

    const button = screen.getByRole('button', { name: /get started/i })

    expect(button).toBeInTheDocument()
  })

  it('renders the design system showcase section', () => {
    render(<Home />)

    const showcaseHeading = screen.getByRole('heading', { name: /design system showcase/i })

    expect(showcaseHeading).toBeInTheDocument()
  })

  it('renders button variants section', () => {
    render(<Home />)

    const variantsHeading = screen.getByRole('heading', { name: /button variants/i })

    expect(variantsHeading).toBeInTheDocument()
  })

  it('renders input components section', () => {
    render(<Home />)

    const inputHeading = screen.getByRole('heading', { name: /input components/i })

    expect(inputHeading).toBeInTheDocument()
  })
}) 