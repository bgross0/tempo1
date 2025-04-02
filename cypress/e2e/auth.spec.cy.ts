// cypress/integration/auth.spec.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    // Visit home page before each test
    cy.visit('/');
  });
  
  it('should redirect unauthenticated users to login page', () => {
    // Attempt to access protected page
    cy.visit('/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });
  
  it('should allow user to sign up with email and password', () => {
    // Generate a random email to avoid duplicate account issues
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
    
    // Navigate to signup page
    cy.get('[data-test="signup-link"]').click();
    cy.url().should('include', '/signup');
    
    // Fill out signup form
    cy.get('input[name="email"]').type(randomEmail);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after signup
    cy.url().should('include', '/dashboard');
    
    // Verify user is logged in - user email should be visible in header
    cy.get('[data-test="user-email"]').should('contain', randomEmail);
  });
  
  it('should allow user to log in with correct credentials', () => {
    // Navigate to login page if not already there
    cy.get('[data-test="login-link"]').click();
    cy.url().should('include', '/login');
    
    // Fill out login form with test account
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after login
    cy.url().should('include', '/dashboard');
  });
  
  it('should show error with incorrect credentials', () => {
    // Navigate to login page
    cy.get('[data-test="login-link"]').click();
    
    // Fill out login form with incorrect password
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('[data-test="login-error"]').should('be.visible');
    
    // Should not redirect to dashboard
    cy.url().should('include', '/login');
  });
  
  it('should allow password reset request', () => {
    // Navigate to login page
    cy.get('[data-test="login-link"]').click();
    
    // Click forgot password link
    cy.get('[data-test="forgot-password-link"]').click();
    cy.url().should('include', '/reset-password');
    
    // Fill out reset form
    cy.get('input[name="email"]').type('test@example.com');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show success message
    cy.get('[data-test="reset-success-message"]').should('be.visible');
  });
  
  it('should allow user to log out', () => {
    // Log in first
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    
    // Click logout button
    cy.get('[data-test="user-menu-button"]').click();
    cy.get('[data-test="logout-button"]').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
    
    // Attempt to access protected page after logout
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});