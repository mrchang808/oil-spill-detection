import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsPanel from './StatsPanel';
import { OilSpillDetection } from '../../types/oilSpill';

const base: OilSpillDetection = {
  id: '1',
  latitude: 40.23,
  longitude: 50.81,
  status: 'Oil spill',
  detected_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const mockDetections: OilSpillDetection[] = [
  { ...base, id: '1', status: 'Oil spill', validation_status: 'Verified' },
  { ...base, id: '2', status: 'Oil spill', validation_status: 'Unverified' },
  { ...base, id: '3', status: 'Non Oil spill', validation_status: 'Verified' },
  { ...base, id: '4', status: 'Non Oil spill', validation_status: 'Unverified' },
  { ...base, id: '5', status: 'Oil spill', validation_status: 'Verified' },
];

describe('StatsPanel', () => {
  it('renders the panel container', () => {
    render(<StatsPanel detections={[]} />);
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
  });

  it('shows skeleton state when loading', () => {
    render(<StatsPanel detections={[]} loading={true} />);
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('total-count')).not.toBeInTheDocument();
  });

  it('shows zero counts for empty detections', () => {
    render(<StatsPanel detections={[]} />);
    expect(screen.getByTestId('total-count').textContent).toBe('0');
    expect(screen.getByTestId('oil-spill-count').textContent).toBe('0');
    expect(screen.getByTestId('non-oil-count').textContent).toBe('0');
  });

  it('correctly aggregates total detections', () => {
    render(<StatsPanel detections={mockDetections} />);
    expect(screen.getByTestId('total-count').textContent).toBe('5');
  });

  it('correctly counts oil spills', () => {
    render(<StatsPanel detections={mockDetections} />);
    expect(screen.getByTestId('oil-spill-count').textContent).toBe('3');
  });

  it('correctly counts non-oil spills', () => {
    render(<StatsPanel detections={mockDetections} />);
    expect(screen.getByTestId('non-oil-count').textContent).toBe('2');
  });

  it('shows verified percentage when detections are present', () => {
    render(<StatsPanel detections={mockDetections} />);
    expect(screen.getByTestId('stat-verified')).toBeInTheDocument();
    expect(screen.getByTestId('verified-pct').textContent).toBe('60%');
  });

  it('does not show verified stat when detections list is empty', () => {
    render(<StatsPanel detections={[]} />);
    expect(screen.queryByTestId('stat-verified')).not.toBeInTheDocument();
  });
});
