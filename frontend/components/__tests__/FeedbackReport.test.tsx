import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedbackReport } from '../FeedbackReport';
import { CheckResponse } from '@/lib/types';

const mockAllCorrect: CheckResponse = {
  report: [
    { targetToken: 'The', userToken: 'The', status: 'correct' },
    { targetToken: 'quick', userToken: 'quick', status: 'correct' },
  ],
  summary: { total: 2, correctCount: 2, wrongCount: 0, ignoredCount: 0 },
};

const mockWithErrors: CheckResponse = {
  report: [
    { targetToken: 'The', userToken: 'The', status: 'correct' },
    { targetToken: 'quick', userToken: 'quik', status: 'wrong' },
    { targetToken: 'fox', userToken: '', status: 'ignored_by_case_or_punct' },
  ],
  summary: { total: 3, correctCount: 1, wrongCount: 1, ignoredCount: 1 },
};

describe('FeedbackReport', () => {
  it('renders all words', () => {
    render(<FeedbackReport feedback={mockAllCorrect} />);
    expect(screen.getByText('The')).toBeInTheDocument();
    expect(screen.getByText('quick')).toBeInTheDocument();
  });

  it('displays correct status icons', () => {
    render(<FeedbackReport feedback={mockAllCorrect} />);
    // Check for correct status icon (✓)
    expect(screen.getAllByText('✓')).toHaveLength(2);
  });

  it('handles wrong and ignored words', () => {
    render(<FeedbackReport feedback={mockWithErrors} />);
    // Target tokens are displayed
    expect(screen.getByText('The')).toBeInTheDocument();
    expect(screen.getByText('quick')).toBeInTheDocument();
    expect(screen.getByText('fox')).toBeInTheDocument();
    // User input for wrong word is shown in parentheses
    expect(screen.getByText('(quik)')).toBeInTheDocument();
    // Wrong status icon (✗)
    expect(screen.getByText('✗')).toBeInTheDocument();
    // Ignored status icon (~)
    expect(screen.getByText('~')).toBeInTheDocument();
  });

  it('handles empty feedback', () => {
    const empty: CheckResponse = {
      report: [],
      summary: { total: 0, correctCount: 0, wrongCount: 0, ignoredCount: 0 },
    };
    render(<FeedbackReport feedback={empty} />);
    // Empty report should render container without words
    const container = screen.getByTestId('feedback-report-container');
    expect(container).toBeInTheDocument();
  });
});
