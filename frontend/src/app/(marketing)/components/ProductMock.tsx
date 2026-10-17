import React from 'react';

/**
 * Pure-CSS mock of the performance analytics dashboard.
 */
export function AnalyticsMock() {
  const bars = [38, 52, 47, 61, 58, 72, 69, 84];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M'];
  return (
    <div className="mm-analytics" aria-hidden="true">
      <div className="mm-analytics-head">
        <h4>Your progress</h4>
        <span>+18% this week</span>
      </div>
      <div className="mm-analytics-body">
        <div className="mm-bars">
          {bars.map((h, i) => (
            <i
              key={i}
              className={i >= bars.length - 2 ? 'hot' : ''}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mm-bar-labels">
          {days.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mm-kpis">
          <div className="mm-kpi">
            <b>78%</b>
            <span>Avg. score</span>
          </div>
          <div className="mm-kpi">
            <b>1,240</b>
            <span>MCQs solved</span>
          </div>
          <div className="mm-kpi">
            <b>12</b>
            <span>Day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
