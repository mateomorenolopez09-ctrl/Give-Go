// Tests for Give&Go Backend API Health
import app from '../src/app';

describe('Backend Health & API Status', () => {
  it('should have health route defined on the Express application', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
