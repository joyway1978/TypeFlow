'use client';
import { CheckResponse } from '@/lib/types';
import { FeedbackWord } from './FeedbackWord';

interface FeedbackReportProps {
  feedback: CheckResponse;
}

export function FeedbackReport({ feedback }: FeedbackReportProps) {
  return (
    <div className="mt-6 animate-scale-in" data-testid="feedback-report-container">
      <div className="flex flex-wrap justify-center gap-x-1 gap-y-3">
        {feedback.report.map((item, index) => (
          <FeedbackWord
            key={`${item.targetToken}-${index}`}
            targetToken={item.targetToken}
            userToken={item.userToken}
            status={item.status}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
