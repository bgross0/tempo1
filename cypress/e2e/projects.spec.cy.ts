// cypress/integration/projects.spec.cy.ts
describe('Project Management', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
  
  it('should create a new project', () => {
    // Navigate to projects page
    cy.get('[data-test="nav-projects"]').click();
    cy.url().should('include', '/projects');
    
    // Open the new project form
    cy.get('[data-test="add-project-btn"]').click();
    
    // Fill out the form
    cy.get('input[name="name"]').type('Test Project');
    cy.get('textarea[name="description"]').type('This is a test project');
    
    // Set dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    cy.get('input[name="start_date"]').type(today.toISOString().split('T')[0]);
    cy.get('input[name="due_date"]').type(nextMonth.toISOString().split('T')[0]);
    
    // Set priority
    cy.get('[data-test="priority-select"]').click();
    cy.get('[data-test="priority-option-high"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify the project was created
    cy.contains('Test Project').should('be.visible');
    cy.contains('This is a test project').should('be.visible');
  });
  
  it('should edit an existing project', () => {
    // Navigate to projects page
    cy.get('[data-test="nav-projects"]').click();
    
    // Open the project actions menu and click edit
    cy.get('[data-test="project-card"]').first().within(() => {
      cy.get('[data-test="project-menu-btn"]').click();
    });
    cy.get('[data-test="edit-project-btn"]').click();
    
    // Update the project name and description
    cy.get('input[name="name"]').clear().type('Updated Project');
    cy.get('textarea[name="description"]').clear().type('This project has been updated');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify the project was updated
    cy.contains('Updated Project').should('be.visible');
    cy.contains('This project has been updated').should('be.visible');
  });
  
  it('should mark a project as complete', () => {
    // Navigate to projects page
    cy.get('[data-test="nav-projects"]').click();
    
    // Get first project and mark complete
    cy.get('[data-test="project-card"]').first().within(() => {
      cy.get('[data-test="project-menu-btn"]').click();
    });
    cy.get('[data-test="complete-project-btn"]').click();
    
    // Verify the project moves to completed tab
    cy.get('[data-test="completed-tab"]').click();
    cy.get('[data-test="project-card"]').first().should('contain', 'Updated Project');
  });
  
  it('should delete a project', () => {
    // Navigate to projects page
    cy.get('[data-test="nav-projects"]').click();
    
    // Store the current project count
    cy.get('[data-test="project-card"]').then(($cards) => {
      const initialCount = $cards.length;
      
      // Delete the first project
      cy.get('[data-test="project-card"]').first().within(() => {
        cy.get('[data-test="project-menu-btn"]').click();
      });
      cy.get('[data-test="delete-project-btn"]').click();
      
      // Confirm deletion
      cy.get('[data-test="confirm-delete-btn"]').click();
      
      // Verify project was deleted
      cy.get('[data-test="project-card"]').should('have.length', initialCount - 1);
    });
  });
});