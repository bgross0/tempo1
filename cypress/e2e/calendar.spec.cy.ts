// cypress/integration/calendar.spec.cy.ts
describe('Calendar Functionality', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to calendar page
    cy.get('[data-test="nav-calendar"]').click();
    cy.url().should('include', '/calendar');
  });
  
  it('should toggle between day, week, and month views', () => {
    // Check default view is week view
    cy.get('[data-test="calendar-view-selector"]').should('contain', 'Week');
    cy.get('[data-test="week-view"]').should('be.visible');
    
    // Switch to day view
    cy.get('[data-test="day-view-btn"]').click();
    cy.get('[data-test="day-view"]').should('be.visible');
    
    // Switch to month view
    cy.get('[data-test="month-view-btn"]').click();
    cy.get('[data-test="month-view"]').should('be.visible');
  });
  
  it('should navigate to previous and next periods', () => {
    // Store current date information
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    
    // Check current month is displayed
    cy.get('[data-test="calendar-header"]').should('contain', currentMonth);
    
    // Navigate to next month
    cy.get('[data-test="next-period-btn"]').click();
    
    // Calculate next month
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleString('default', { month: 'long' });
    
    // Verify next month is displayed
    cy.get('[data-test="calendar-header"]').should('contain', nextMonthName);
    
    // Navigate back to current month
    cy.get('[data-test="prev-period-btn"]').click();
    
    // Verify current month is displayed again
    cy.get('[data-test="calendar-header"]').should('contain', currentMonth);
  });
  
  it('should create an event via the calendar', () => {
    // Click on a time slot to create an event
    cy.get('[data-test="calendar-time-slot"]').first().click();
    
    // Fill out the event form
    cy.get('input[name="name"]').type('Calendar Test Event');
    cy.get('textarea[name="description"]').type('This is an event created from the calendar');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify the event appears on the calendar
    cy.get('[data-test="calendar-event"]').should('contain', 'Calendar Test Event');
  });
  
  it('should display mini-calendar and allow date selection', () => {
    // Verify mini-calendar exists
    cy.get('[data-test="mini-calendar"]').should('be.visible');
    
    // Select a date from mini-calendar
    cy.get('[data-test="mini-calendar-day"]').eq(15).click();
    
    // Verify main calendar updates to show selected date
    cy.get('[data-test="selected-date-indicator"]').should('be.visible');
  });
  
  it('should drag and drop to reschedule events', () => {
    // Find an existing event
    cy.get('[data-test="calendar-event"]').first().as('sourceEvent');
    
    // Get initial position
    cy.get('@sourceEvent').then(($el) => {
      const initialPosition = $el.position();
      
      // Drag event to new time slot
      cy.get('@sourceEvent')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: initialPosition.left, clientY: initialPosition.top + 100 })
        .trigger('mouseup');
      
      // Verify event has moved
      cy.get('@sourceEvent').should(($movedEl) => {
        const newPosition = $movedEl.position();
        expect(newPosition.top).to.be.greaterThan(initialPosition.top);
      });
    });
  });
});