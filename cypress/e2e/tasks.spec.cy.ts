// cypress/integration/tasks.spec.js
describe('Task Management', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
  
  it('should create a new task', () => {
    // Navigate to tasks page
    cy.get('[data-test="nav-tasks"]').click();
    
    // Open the new task form
    cy.get('[data-test="add-task-btn"]').click();
    
    // Fill out the form
    cy.get('input[name="taskName"]').type('Test Task');
    cy.get('textarea[name="taskDescription"]').type('This is a test task');
    cy.get('input[name="taskDueDate"]').type('2023-12-31');
    cy.get('select[name="taskPriority"]').select('high');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify the task was created
    cy.contains('Test Task').should('be.visible');
    cy.contains('high').should('be.visible');
  });
});