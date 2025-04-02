// cypress/integration/analytics.spec.cy.ts
describe('Analytics Dashboard', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to analytics page
    cy.get('[data-test="nav-analytics"]').click();
    cy.url().should('include', '/analytics');
  });
  
  it('should display productivity statistics', () => {
    // Check that productivity score component is present
    cy.get('[data-test="productivity-score"]').should('be.visible');
    
    // Check that productivity score is a number between 0 and 100
    cy.get('[data-test="productivity-score-value"]').invoke('text').then((text) => {
      const score = Number(text);
      expect(score).to.be.gte(0);
      expect(score).to.be.lte(100);
    });
  });
  
  it('should display task completion chart', () => {
    // Check that task completion chart is present
    cy.get('[data-test="task-completion-chart"]').should('be.visible');
    
    // Check chart has days of the week
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    daysOfWeek.forEach(day => {
      cy.get('[data-test="task-completion-chart"]').should('contain', day);
    });
  });
  
  it('should display time allocation chart', () => {
    // Check that time allocation chart is present
    cy.get('[data-test="time-allocation-chart"]').should('be.visible');
  });
  
  it('should toggle between week and month views', () => {
    // Check default view is week
    cy.get('[data-test="period-selector"]').should('contain', 'This Week');
    
    // Switch to month view
    cy.get('[data-test="month-view-tab"]').click();
    cy.get('[data-test="period-selector"]').should('contain', 'This Month');
    
    // Check date range updated
    cy.get('[data-test="date-range"]').should('contain', 'Month');
    
    // Switch back to week view
    cy.get('[data-test="week-view-tab"]').click();
    cy.get('[data-test="period-selector"]').should('contain', 'This Week');
  });
  
  it('should display summary metrics', () => {
    // Check that summary cards are present
    cy.get('[data-test="completed-tasks-card"]').should('be.visible');
    cy.get('[data-test="time-spent-card"]').should('be.visible');
    cy.get('[data-test="overdue-tasks-card"]').should('be.visible');
    
    // Check that completed tasks is a number
    cy.get('[data-test="completed-tasks-value"]').invoke('text').then((text) => {
      const count = Number(text);
      expect(count).to.be.gte(0);
    });
    
    // Check that time spent shows hours and minutes
    cy.get('[data-test="time-spent-value"]').should('contain', 'h');
    
    // Check that overdue tasks is a number
    cy.get('[data-test="overdue-tasks-value"]').invoke('text').then((text) => {
      const count = Number(text);
      expect(count).to.be.gte(0);
    });
  });
});