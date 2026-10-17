import React from 'react';
import { Timer } from 'lucide-react';

/**
 * Pure-CSS mock of the Merit Master test interface.
 * Used on the marketing site to show the product, not effects.
 */
export function TestInterfaceMock() {
  return (
    <div className="mm-mock" aria-hidden="true">
      <div className="mm-mock-bar">
        <span className="mm-dot" style={{ background: '#f87171' }} />
        <span className="mm-dot" style={{ background: '#fbbf24' }} />
        <span className="mm-dot" style={{ background: '#34d399' }} />
        <span className="mm-mock-url">meritmaster.pk/test-engine</span>
      </div>
      <div className="mm-mock-body">
        <div className="mm-mock-main">
          <span className="mm-mock-timer">
            <Timer size={13} /> 42:18 remaining
          </span>
          <div className="mm-mock-progress">
            <i />
          </div>
          <div className="mm-mock-qnum">Question 64 of 100</div>
          <p className="mm-mock-q">
            Which river is known as the &ldquo;lifeline of Punjab&rdquo; and flows
            through five major tributaries?
          </p>
          <div className="mm-mock-opt">
            <span className="k">A</span> River Kabul
          </div>
          <div className="mm-mock-opt picked">
            <span className="k">B</span> River Indus
          </div>
          <div className="mm-mock-opt">
            <span className="k">C</span> River Jhelum
          </div>
          <div className="mm-mock-opt">
            <span className="k">D</span> River Chenab
          </div>
        </div>
        <div className="mm-mock-side">
          <h5>Questions</h5>
          <div className="mm-palette">
            {Array.from({ length: 16 }).map((_, i) => (
              <i
                key={i}
                className={i < 10 ? 'done' : i === 10 ? 'now' : ''}
              >
                {i + 58}
              </i>
            ))}
          </div>
          <div className="mm-mock-actions">
            <span className="skip">Skip</span>
            <span className="next">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
