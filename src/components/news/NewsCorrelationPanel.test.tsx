import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import NewsCorrelationPanel from './NewsCorrelationPanel';
import { OilSpillDetection } from '../../types/oilSpill';

const oilSpillDetection: OilSpillDetection = {
  id: 'test-123',
  latitude: 40.233,
  longitude: 50.812,
  status: 'Oil spill',
  detected_at: '2026-01-15T10:00:00Z',
  created_at: '2026-01-15T10:00:00Z',
  confidence: 0.91,
  severity: 'High',
  source: 'Sentinel-1 SAR',
};

const nonOilDetection: OilSpillDetection = {
  ...oilSpillDetection,
  id: 'test-456',
  status: 'Non Oil spill',
};

describe('NewsCorrelationPanel', () => {
  it('renders nothing when detection is null', () => {
    const { container } = render(
      <NewsCorrelationPanel detection={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the panel for a given detection', () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    expect(screen.getByTestId('news-correlation-panel')).toBeInTheDocument();
  });

  it('shows "News Correlation" heading', () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    expect(screen.getByText('News Correlation')).toBeInTheDocument();
  });

  it('shows no-news message for non-oil-spill detections', () => {
    render(<NewsCorrelationPanel detection={nonOilDetection} onClose={vi.fn()} />);
    expect(screen.getByTestId('no-news-message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={onClose} />);
    await userEvent.click(screen.getByTestId('news-panel-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders articles after loading for oil spill detections', async () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    await waitFor(
      () => expect(screen.getByTestId('articles-count')).toBeInTheDocument(),
      { timeout: 2000 }
    );
    expect(screen.getByTestId('news-article-0')).toBeInTheDocument();
  });

  it('shows article titles after loading', async () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    await waitFor(
      () => expect(screen.getAllByTestId('article-title').length).toBeGreaterThan(0),
      { timeout: 2000 }
    );
  });

  it('shows detection status badge', () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    expect(screen.getByText('Oil spill')).toBeInTheDocument();
  });

  it('shows region name in the header', async () => {
    render(<NewsCorrelationPanel detection={oilSpillDetection} onClose={vi.fn()} />);
    await waitFor(
      () => expect(screen.getByText('Caspian Sea')).toBeInTheDocument(),
      { timeout: 500 }
    );
  });
});
