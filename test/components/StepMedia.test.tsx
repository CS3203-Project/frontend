import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepMedia from '../../src/components/StepMedia';

describe('StepMedia Component', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 3,
    canProceed: true,
    isLoading: false,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onSubmit: vi.fn(),
    video: {
      mp4: '/test-video.mp4',
      webm: '/test-video.webm',
    },
    poster: '/test-poster.jpg',
  };

  it('should render step indicator', () => {
    render(<StepMedia {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('should render step titles when provided', () => {
    render(
      <StepMedia
        {...defaultProps}
        stepTitles={['Personal Info', 'Account Details', 'Confirmation']}
        stepSubtitles={['Enter your details', 'Set up your account', 'Review and submit']}
      />
    );
    
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Enter your details')).toBeInTheDocument();
  });

  it('should disable back button on first step', () => {
    render(<StepMedia {...defaultProps} currentStep={1} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeDisabled();
  });

  it('should enable back button on later steps', () => {
    render(<StepMedia {...defaultProps} currentStep={2} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).not.toBeDisabled();
  });

  it('should call onPrev when back button is clicked', () => {
    const onPrev = vi.fn();
    render(<StepMedia {...defaultProps} currentStep={2} onPrev={onPrev} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('should render Next button on non-final steps', () => {
    render(<StepMedia {...defaultProps} currentStep={1} totalSteps={3} />);
    
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should call onNext when next button is clicked', () => {
    const onNext = vi.fn();
    render(<StepMedia {...defaultProps} currentStep={1} onNext={onNext} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should render Create Account button on final step', () => {
    render(<StepMedia {...defaultProps} currentStep={3} totalSteps={3} />);
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should call onSubmit when create account button is clicked', () => {
    const onSubmit = vi.fn();
    render(<StepMedia {...defaultProps} currentStep={3} totalSteps={3} onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should disable next button when canProceed is false', () => {
    render(<StepMedia {...defaultProps} canProceed={false} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<StepMedia {...defaultProps} currentStep={3} totalSteps={3} isLoading={true} />);
    
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });

  it('should render progress dots', () => {
    const { container } = render(<StepMedia {...defaultProps} currentStep={2} totalSteps={3} />);
    
    const dots = container.querySelectorAll('span');
    // Should have at least the step indicator dots
    expect(dots.length).toBeGreaterThan(0);
  });

  it('should render video element with sources', () => {
    const { container } = render(<StepMedia {...defaultProps} />);
    
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('poster', '/test-poster.jpg');
    
    const sources = container.querySelectorAll('source');
    expect(sources.length).toBe(2);
  });
});