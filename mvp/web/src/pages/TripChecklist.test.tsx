import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TripChecklist from './TripChecklist';

describe('TripChecklist', () => {
  it('renders nothing (superseded by TripPlan)', () => {
    const { container } = render(<TripChecklist />);
    expect(container).toBeEmptyDOMElement();
  });
});
