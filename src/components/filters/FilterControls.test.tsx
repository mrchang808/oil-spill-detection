import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterControls from './FilterControls';

describe('FilterControls', () => {
  const defaultProps = {
    showOilSpills: true,
    showNonOilSpills: true,
    onToggleOilSpills: vi.fn(),
    onToggleNonOilSpills: vi.fn(),
  };

  it('renders the filter controls container', () => {
    render(<FilterControls {...defaultProps} />);
    expect(screen.getByTestId('filter-controls')).toBeInTheDocument();
  });

  it('renders both checkboxes', () => {
    render(<FilterControls {...defaultProps} />);
    expect(screen.getByTestId('toggle-oil-spills')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-non-oil-spills')).toBeInTheDocument();
  });

  it('oil spills checkbox reflects showOilSpills prop', () => {
    const { rerender } = render(<FilterControls {...defaultProps} showOilSpills={true} />);
    expect(screen.getByTestId('toggle-oil-spills')).toBeChecked();

    rerender(<FilterControls {...defaultProps} showOilSpills={false} />);
    expect(screen.getByTestId('toggle-oil-spills')).not.toBeChecked();
  });

  it('non-oil spills checkbox reflects showNonOilSpills prop', () => {
    const { rerender } = render(<FilterControls {...defaultProps} showNonOilSpills={true} />);
    expect(screen.getByTestId('toggle-non-oil-spills')).toBeChecked();

    rerender(<FilterControls {...defaultProps} showNonOilSpills={false} />);
    expect(screen.getByTestId('toggle-non-oil-spills')).not.toBeChecked();
  });

  it('calls onToggleOilSpills when oil spill checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<FilterControls {...defaultProps} onToggleOilSpills={onToggle} />);
    fireEvent.click(screen.getByTestId('toggle-oil-spills'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleNonOilSpills when non-oil spill checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<FilterControls {...defaultProps} onToggleNonOilSpills={onToggle} />);
    fireEvent.click(screen.getByTestId('toggle-non-oil-spills'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('checkboxes have accessible aria-labels', () => {
    render(<FilterControls {...defaultProps} />);
    expect(screen.getByLabelText('Show Oil Spills')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Non Oil Spills')).toBeInTheDocument();
  });
});
