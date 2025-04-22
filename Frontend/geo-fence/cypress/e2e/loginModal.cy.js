// cypress/e2e/loginModal.cy.js

describe('Login Modal Component', () => {
    beforeEach(() => {
      // Mock the Redux store
      cy.window().then((win) => {
        win.store = {
          dispatch: cy.stub().as('dispatch')
        };
      });
      
      // Visit the page that contains the login modal trigger
      cy.visit('/');
      
      // Mock SweetAlert2
      cy.window().then((win) => {
        win.Swal = {
          fire: cy.stub().as('swalFire')
        };
      });
    });
  
    it('should open login modal when the login button is clicked', () => {
      // Find and click the login button
      cy.contains('Login').click();
      
      // Check if the modal is displayed
      cy.contains('Log In').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });
  
    it('should close the modal when the close button is clicked', () => {
      // Open the modal
      cy.contains('Login').click();
      
      // Click the close button
      cy.get('.fa-circle-xmark').click();
      
      // Check if the modal is closed
      cy.contains('Log In').should('not.exist');
    });
  
    it('should switch to signup mode when "Sign up" is clicked', () => {
      // Open the modal
      cy.contains('Login').click();
      
      // Click the sign up link
      cy.contains('Sign up').click();
      
      // Check if the modal is in signup mode
      cy.contains('Register').should('be.visible');
      cy.get('input[placeholder="Confirm Password"]').should('be.visible');
    });
  
    it('should switch back to login mode when "Log in" is clicked in signup mode', () => {
      // Open the modal
      cy.contains('Login').click();
      
      // Switch to signup mode
      cy.contains('Sign up').click();
      
      // Switch back to login mode
      cy.contains('Log in').click();
      
      // Check if the modal is in login mode
      cy.contains('Log In').should('be.visible');
      cy.get('input[placeholder="Confirm Password"]').should('not.exist');
    });
  
    it('should dispatch loginUser action when login button is clicked', () => {
      // Open the modal
      cy.contains('Login').click();
      
      // Fill in the login form
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      
      // Click the login button
      cy.contains('button', 'Log In').click();
      
      // Check if the login action was dispatched
      cy.get('@dispatch').should('be.calledOnce');
    });
  
    it('should call register API when register form is submitted', () => {
      // Mock the API call
      cy.intercept('POST', 'auth/register', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            email: 'test@example.com'
          }
        }
      }).as('registerRequest');
      
      // Open the modal
      cy.contains('Login').click();
      
      // Switch to signup mode
      cy.contains('Sign up').click();
      
      // Fill in the signup form
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').eq(0).type('password123');
      cy.get('input[type="password"]').eq(1).type('password123');
      
      // Click the register button
      cy.contains('button', 'Log In').click();
      
      // Wait for the API call to complete
      cy.wait('@registerRequest');
      
      // Check if success message is shown
      cy.get('@swalFire').should('be.calledWith', {
        position: 'center',
        icon: 'success',
        title: 'Register success',
        showConfirmButton: false,
        timer: 2000
      });
      
      // Check if the modal switched back to login mode
      cy.contains('Log In').should('be.visible');
    });
  
    it('should show error when passwords do not match', () => {
      // Open the modal
      cy.contains('Login').click();
      
      // Switch to signup mode
      cy.contains('Sign up').click();
      
      // Fill in the signup form with mismatched passwords
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').eq(0).type('password123');
      cy.get('input[type="password"]').eq(1).type('differentpassword');
      
      // Click the register button
      cy.contains('button', 'Log In').click();
      
      // Check if error message is shown
      cy.get('@swalFire').should('be.calledWith', {
        position: 'top-end',
        icon: 'error',
        title: 'The confirm password does not match',
        showConfirmButton: false,
        timer: 2000
      });
    });
  
    it('should show error when email already exists', () => {
      // Mock the API call with 422 status
      cy.intercept('POST', 'auth/register', {
        statusCode: 422,
        body: {
          message: 'Email already exists'
        }
      }).as('registerRequest');
      
      // Open the modal
      cy.contains('Login').click();
      
      // Switch to signup mode
      cy.contains('Sign up').click();
      
      // Fill in the signup form
      cy.get('input[type="email"]').type('existing@example.com');
      cy.get('input[type="password"]').eq(0).type('password123');
      cy.get('input[type="password"]').eq(1).type('password123');
      
      // Click the register button
      cy.contains('button', 'Log In').click();
      
      // Wait for the API call to complete
      cy.wait('@registerRequest');
      
      // Check if error message is shown
      cy.get('@swalFire').should('be.calledWith', {
        position: 'center',
        icon: 'error',
        title: 'Email already exists',
        showConfirmButton: false,
        timer: 2000
      });
    });
  });